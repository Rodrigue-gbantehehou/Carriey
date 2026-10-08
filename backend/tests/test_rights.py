"""
Droits d'accès : matrice rôles × routes admin, isolation entre utilisateurs (IDOR),
comptes désactivés.

Règle : un test de droits vérifie UNIQUEMENT la décision d'autorisation
(401 / 403 / 404 vs « passé »). Le comportement métier de la route est testé ailleurs.
"""
import pytest

from app.models.user import UserRole
from app.models.resume import Resume
from app.models.payment import PaymentStatus
from tests.conftest import API, headers_for

pytestmark = pytest.mark.rights

DENIED = (401, 403)

# Routes de lecture réservées aux admins (ADMIN et SUPER_ADMIN).
ADMIN_READ_ROUTES = [
    "/admin/users/",
    "/admin/templates/",
    "/admin/stats/overview",
    "/admin/audit/",
    "/admin/payments/",
    "/admin/resumes/",
    "/admin/resumes/stats",
    "/admin/reports/users.csv",
    "/admin/reports/payments.csv",
    "/admin/reports/ai-stats",
    "/admin/configs/",
    "/plans/admin",
]

# Routes d'écriture sensibles : (méthode, chemin, corps JSON).
# {uid} / {pid} / {tid} sont remplacés par de vrais identifiants.
ADMIN_WRITE_ROUTES = [
    ("PUT", "/admin/configs/ai_key_gemini", {"value": "stolen-key"}),
    ("PATCH", "/admin/payments/{pid}/confirm", None),
    ("PATCH", "/admin/users/{uid}/toggle-active", None),
    ("PATCH", "/admin/templates/{tid}/toggle", None),
]

SUPER_ADMIN_ONLY_ROUTES = [
    ("PATCH", "/admin/users/{uid}/role", {"role": "super_admin"}),
    ("POST", "/admin/users/{uid}/reset-password", {"new_password": "Password123"}),
    ("DELETE", "/admin/templates/{tid}", None),
]


@pytest.fixture
def ids(make_user, make_template, make_payment):
    victim = make_user()
    template = make_template()
    payment = make_payment(victim, template)
    return {"uid": victim.id, "tid": template.id, "pid": payment.id}


def _call(client, method, path, headers=None, body=None):
    return client.request(method, f"{API}{path}", headers=headers or {}, json=body)


# ─── Matrice lecture ──────────────────────────────────────────────────────────
@pytest.mark.parametrize("path", ADMIN_READ_ROUTES)
def test_admin_read_routes_reject_anonymous(client, path):
    assert client.get(f"{API}{path}").status_code == 401


@pytest.mark.parametrize("path", ADMIN_READ_ROUTES)
def test_admin_read_routes_reject_regular_user(client, make_user, path):
    res = client.get(f"{API}{path}", headers=headers_for(make_user(UserRole.USER)))
    assert res.status_code == 403


@pytest.mark.parametrize("role", [UserRole.ADMIN, UserRole.SUPER_ADMIN])
@pytest.mark.parametrize("path", ADMIN_READ_ROUTES)
def test_admin_read_routes_allow_admins(client, make_user, path, role):
    res = client.get(f"{API}{path}", headers=headers_for(make_user(role)))
    assert res.status_code not in DENIED, f"{role.value} refusé sur {path}: {res.status_code}"


# ─── Matrice écriture ─────────────────────────────────────────────────────────
@pytest.mark.parametrize("method,path,body", ADMIN_WRITE_ROUTES + SUPER_ADMIN_ONLY_ROUTES)
def test_admin_write_routes_reject_regular_user(client, make_user, ids, method, path, body):
    res = _call(client, method, path.format(**ids), headers_for(make_user()), body)
    assert res.status_code == 403


@pytest.mark.parametrize("method,path,body", SUPER_ADMIN_ONLY_ROUTES)
def test_super_admin_routes_reject_admin(client, make_user, ids, method, path, body):
    res = _call(client, method, path.format(**ids), headers_for(make_user(UserRole.ADMIN)), body)
    assert res.status_code == 403


def test_user_cannot_self_confirm_payment(client, db_session, make_user, make_template, make_payment):
    """Un utilisateur ne doit jamais pouvoir valider son propre paiement via la route admin."""
    user = make_user()
    payment = make_payment(user, make_template())
    res = client.patch(f"{API}/admin/payments/{payment.id}/confirm", headers=headers_for(user))
    assert res.status_code == 403
    db_session.refresh(payment)
    assert payment.status == PaymentStatus.PENDING


def test_user_cannot_promote_self(client, db_session, make_user):
    user = make_user()
    res = client.patch(f"{API}/admin/users/{user.id}/role", headers=headers_for(user), json={"role": "super_admin"})
    assert res.status_code == 403
    db_session.refresh(user)
    assert user.role == UserRole.USER


# ─── Isolation entre utilisateurs (IDOR) ──────────────────────────────────────
@pytest.fixture
def two_users_with_resume(db_session, make_user):
    alice, bob = make_user(), make_user()
    resume = Resume(user_id=bob.id, title="CV de Bob", content={"secret": "bob"})
    db_session.add(resume)
    db_session.commit()
    db_session.refresh(resume)
    return alice, bob, resume


def test_user_cannot_read_other_user_resume(client, two_users_with_resume):
    alice, _, resume = two_users_with_resume
    res = client.get(f"{API}/resumes/{resume.id}", headers=headers_for(alice))
    assert res.status_code == 404


def test_user_cannot_update_other_user_resume(client, db_session, two_users_with_resume):
    alice, _, resume = two_users_with_resume
    res = client.put(
        f"{API}/resumes/{resume.id}",
        headers=headers_for(alice),
        json={"title": "pwned", "content": {"secret": "alice"}},
    )
    assert res.status_code in (404, 422)
    db_session.refresh(resume)
    assert resume.title == "CV de Bob"


def test_user_cannot_delete_other_user_resume(client, db_session, two_users_with_resume):
    alice, _, resume = two_users_with_resume
    res = client.delete(f"{API}/resumes/{resume.id}", headers=headers_for(alice))
    assert res.status_code == 404
    assert db_session.get(Resume, resume.id) is not None


def test_resume_list_only_returns_own_documents(client, two_users_with_resume):
    alice, _, resume = two_users_with_resume
    res = client.get(f"{API}/resumes/", headers=headers_for(alice))
    assert res.status_code == 200
    assert resume.id not in {r["id"] for r in res.json()}


def test_user_cannot_read_other_user_payment(client, make_user, make_template, make_payment):
    alice, bob = make_user(), make_user()
    payment = make_payment(bob, make_template())
    res = client.get(f"{API}/payments/{payment.id}/status", headers=headers_for(alice))
    assert res.status_code == 404


# ─── Comptes désactivés ───────────────────────────────────────────────────────
def test_inactive_user_rejected_on_protected_routes(client, make_user):
    user = make_user(is_active=False)
    assert client.get(f"{API}/auth/me", headers=headers_for(user)).status_code == 400
    assert client.get(f"{API}/resumes/", headers=headers_for(user)).status_code == 400



def test_inactive_user_cannot_use_ai(client, make_user):
    """Un compte désactivé est rejeté (400) sur toutes les routes /ai/*. (GAP-RIGHTS-01 corrigé)"""
    user = make_user(is_active=False)
    res = client.post(f"{API}/ai/extract-job", headers=headers_for(user), json={"job_text": "Dev Python"})
    assert res.status_code in (400, 403)

