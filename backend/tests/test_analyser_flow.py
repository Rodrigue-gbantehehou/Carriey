"""
Tests du parcours /analyser — CV-001

Simule le parcours complet d'un utilisateur depuis la page /analyser :
  1. Analyse de correspondance (analyze-fit) — disponible pour tous
  2. Adaptation du CV (tailor-cv)          — PRO uniquement
  3. Vérification que les champs retournés correspondent au contrat TS

Architecture de mock:
- Le service IA est entièrement mocké (AsyncMock) pour des tests déterministes.
- Le profil est créé directement en DB pour tester le chemin complet.
"""
from unittest.mock import patch, AsyncMock
import pytest

from tests.conftest import API, headers_for

pytestmark = pytest.mark.ai

JOB_TEXT = "Nous recherchons un développeur Python senior avec expérience en FastAPI et PostgreSQL."

# Réponse canonique de analyze-fit (doit correspondre à AnalyzeFitResponseSchema TS)
MOCK_FIT = {
    "score": 78,
    "verdict": "Bon profil, quelques lacunes mineures.",
    "strengths": ["Expérience Python solide", "Connaissance des APIs REST"],
    "gaps": ["Pas de certification AWS"],
    "angle": {"title": "Dev Backend Python", "advice": "Mettez en avant FastAPI."},
    "keywords_to_use": ["Python", "FastAPI", "PostgreSQL"],
}

# Réponse canonique de tailor-cv (doit correspondre à TailorCvResponseSchema TS)
MOCK_TAILOR = {
    "summary": "Développeur Python senior spécialisé en FastAPI.",
    "experiences": {
        "exp-1": {"description": "Développement d'APIs REST avec FastAPI et PostgreSQL."}
    },
    "disabledSections": [],
    "disabledItems": {},
}


# ── Helpers ──────────────────────────────────────────────────────────────────

def _make_profile(db, user):
    """Crée un profil minimal nécessaire pour les endpoints IA."""
    from app.models.profile import MasterProfile
    profile = MasterProfile(
        user_id=user.id,
        first_name="Jean",
        last_name="Dupont",
        title="Développeur Python",
        bio="Expert Python avec 5 ans d'expérience.",
    )
    db.add(profile)
    db.commit()
    return profile


# ── Tests ────────────────────────────────────────────────────────────────────

class TestAnalyzeFlow:
    """Parcours analyze-fit → disponible à tous les utilisateurs connectés."""

    def test_analyze_fit_requires_auth(self, client):
        """Un utilisateur anonyme est rejeté."""
        res = client.post(f"{API}/ai/analyze-fit", json={"job_description": JOB_TEXT})
        assert res.status_code in (401, 403)

    def test_analyze_fit_requires_profile(self, client, make_user):
        """Retourne 400 si l'utilisateur n'a pas de profil."""
        user = make_user()
        res = client.post(
            f"{API}/ai/analyze-fit",
            headers=headers_for(user),
            json={"job_description": JOB_TEXT},
        )
        assert res.status_code == 400
        assert "profil" in res.json()["detail"].lower()

    def test_analyze_fit_returns_correct_shape(self, client, db_session, make_user):
        """analyze-fit retourne les champs attendus par AnalyzeFitResponseSchema."""
        user = make_user()
        _make_profile(db_session, user)

        with patch(
            "app.services.ai.service.AIService.analyze_fit",
            new_callable=AsyncMock,
            return_value=(MOCK_FIT, {"tokens": 100}),
        ):
            res = client.post(
                f"{API}/ai/analyze-fit",
                headers=headers_for(user),
                json={"job_description": JOB_TEXT},
            )

        assert res.status_code == 200
        data = res.json()
        # Vérification de tous les champs du contrat TailorCvResponseSchema
        assert isinstance(data["score"], int)
        assert 0 <= data["score"] <= 100
        assert isinstance(data["verdict"], str)
        assert isinstance(data["strengths"], list)
        assert isinstance(data["gaps"], list)
        assert "title" in data["angle"]
        assert "advice" in data["angle"]
        assert isinstance(data["keywords_to_use"], list)

    def test_analyze_fit_free_user_ok(self, client, db_session, make_user):
        """Un utilisateur gratuit peut analyser une offre."""
        user = make_user()  # pas de premium_days
        _make_profile(db_session, user)

        with patch(
            "app.services.ai.service.AIService.analyze_fit",
            new_callable=AsyncMock,
            return_value=(MOCK_FIT, {}),
        ):
            res = client.post(
                f"{API}/ai/analyze-fit",
                headers=headers_for(user),
                json={"job_description": JOB_TEXT},
            )
        assert res.status_code == 200


class TestTailorCvFlow:
    """Parcours tailor-cv — PRO uniquement."""

    def test_tailor_cv_blocked_for_free_user(self, client, db_session, make_user):
        """Un utilisateur gratuit reçoit 403."""
        user = make_user()
        _make_profile(db_session, user)
        res = client.post(
            f"{API}/ai/tailor-cv",
            headers=headers_for(user),
            json={"job_description": JOB_TEXT},
        )
        assert res.status_code == 403

    def test_tailor_cv_blocked_for_expired_pro(self, client, db_session, make_user):
        """Un utilisateur PRO expiré reçoit 403."""
        user = make_user(premium_days=-5)
        _make_profile(db_session, user)
        res = client.post(
            f"{API}/ai/tailor-cv",
            headers=headers_for(user),
            json={"job_description": JOB_TEXT},
        )
        assert res.status_code == 403

    def test_tailor_cv_returns_correct_shape(self, client, db_session, make_user):
        """tailor-cv retourne les champs attendus par TailorCvResponseSchema."""
        user = make_user(premium_days=30)
        _make_profile(db_session, user)

        with patch(
            "app.services.ai.service.AIService.tailor_cv",
            new_callable=AsyncMock,
            return_value=(MOCK_TAILOR, {"tokens": 200}),
        ):
            res = client.post(
                f"{API}/ai/tailor-cv",
                headers=headers_for(user),
                json={"job_description": JOB_TEXT},
            )

        assert res.status_code == 200
        data = res.json()
        # Contrat TailorCvResponse : summary, experiences, disabledSections, disabledItems
        assert "summary" in data, "Champ 'summary' manquant — vérifier service.py et ai-api.ts"
        assert "suggestedSummary" not in data, "Ancien champ 'suggestedSummary' présent — régression CV-001"
        assert "experiences" in data
        assert isinstance(data["experiences"], dict)
        assert "disabledSections" in data
        assert isinstance(data["disabledSections"], list)
        assert "disabledItems" in data
        assert isinstance(data["disabledItems"], dict)

    def test_tailor_cv_no_profile_returns_400(self, client, make_user):
        """Un PRO sans profil reçoit 400."""
        user = make_user(premium_days=30)
        res = client.post(
            f"{API}/ai/tailor-cv",
            headers=headers_for(user),
            json={"job_description": JOB_TEXT},
        )
        assert res.status_code == 400
        assert "profil" in res.json()["detail"].lower()
