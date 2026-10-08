"""
Socle commun de la suite de tests backend Carriey (TECH-002).

Principes d'isolation (cf. docs/TESTING_STRATEGY.md) :
  1. Aucune dépendance au `.env` réel : les variables critiques sont forcées AVANT
     l'import de l'application (load_dotenv n'écrase pas les variables existantes).
  2. Aucune base réelle : SQLite en mémoire, transaction annulée après chaque test.
  3. Aucun appel réseau sortant : toute connexion hors loopback lève une erreur.
  4. Aucun email réel : toutes les méthodes `send_*` du mailer sont mockées.
  5. Aucun fichier écrit dans les dossiers réels : exports/cache redirigés vers tmp_path.
  6. Rate-limiting désactivé par défaut (réactivable via la fixture `rate_limited`).
"""
import os
import socket

# ─── 1. Environnement de test (doit précéder TOUT import de `app`) ────────────
TEST_ENV = {
    "ENVIRONMENT": "test",
    "DATABASE_URL": "sqlite:///:memory:",
    "JWT_SECRET_KEY": "test-secret-key-not-for-production",
    "SECRET_KEY": "test-secret-key-not-for-production",
    # Le bypass sandbox des exports doit être INACTIF par défaut, sinon
    # les tests de paiement passent pour de mauvaises raisons.
    "KKIAPAY_SANDBOX": "false",
    "PAYMENT_SANDBOX": "false",
    "FEDAPAY_SANDBOX": "true",
    "FEDA_WEBHOOK_KEY": "test-feda-webhook-key",
    "PDF_SERVICE_URL": "http://pdf-service.test",
    "PDF_SERVICE_SECRET": "test-pdf-secret",
    "FRONTEND_URL": "http://frontend.test",
}
os.environ.update(TEST_ENV)

from datetime import datetime, timedelta, timezone  # noqa: E402
from unittest.mock import AsyncMock, MagicMock, patch  # noqa: E402

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app.main import app  # noqa: E402
from app.db.session import Base, get_db  # noqa: E402
from app.core.config import settings  # noqa: E402
from app.core.limiter import limiter  # noqa: E402
from app.core.security import create_access_token, get_password_hash  # noqa: E402
from app.models.user import User, UserRole  # noqa: E402
from app.models.template import Template  # noqa: E402
from app.models.payment import Payment, PaymentStatus, PaymentProvider  # noqa: E402

API = settings.API_STR
DEFAULT_PASSWORD = "Password123"

# Garde-fou : on refuse de tourner si la config pointe encore vers une vraie base.
assert settings.DATABASE_URL.startswith("sqlite"), (
    f"Les tests doivent tourner sur SQLite, DATABASE_URL={settings.DATABASE_URL[:12]}..."
)

# ─── 2. Base de données de test ───────────────────────────────────────────────
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session")
def db_engine():
    """Crée les tables de la base de données de test au début de la session."""
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(db_engine):
    """
    Session fraîche par test. La transaction externe est annulée à la fin
    du test : aucune donnée ne fuit d'un test à l'autre.
    """
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


# ─── 3. Blocage réseau ────────────────────────────────────────────────────────
class NetworkBlockedError(OSError):
    """Levée quand un test tente une connexion réseau sortante."""


_LOOPBACK = {"127.0.0.1", "localhost", "::1", "0.0.0.0"}
_real_connect = socket.socket.connect
_real_connect_ex = socket.socket.connect_ex
_real_getaddrinfo = socket.getaddrinfo


def _is_local(address) -> bool:
    if not isinstance(address, tuple):  # sockets Unix / named pipes
        return True
    return str(address[0]) in _LOOPBACK


def _guarded_connect(self, address):
    if not _is_local(address):
        raise NetworkBlockedError(f"Accès réseau interdit pendant les tests : {address}")
    return _real_connect(self, address)


def _guarded_connect_ex(self, address):
    if not _is_local(address):
        raise NetworkBlockedError(f"Accès réseau interdit pendant les tests : {address}")
    return _real_connect_ex(self, address)


def _guarded_getaddrinfo(host, *args, **kwargs):
    if host is not None and str(host) not in _LOOPBACK:
        raise NetworkBlockedError(f"Résolution DNS interdite pendant les tests : {host}")
    return _real_getaddrinfo(host, *args, **kwargs)


@pytest.fixture(autouse=True)
def block_network(monkeypatch):
    monkeypatch.setattr(socket.socket, "connect", _guarded_connect)
    monkeypatch.setattr(socket.socket, "connect_ex", _guarded_connect_ex)
    monkeypatch.setattr(socket, "getaddrinfo", _guarded_getaddrinfo)


# ─── 4. Emails mockés ─────────────────────────────────────────────────────────
@pytest.fixture(autouse=True)
def mailer(monkeypatch):
    """Remplace toutes les méthodes send_* du mailer. Retourne les mocks pour assertions."""
    from app.services.mailer_service import mailer_service

    mocks = {}
    for name in dir(mailer_service):
        if name.startswith("send_") and callable(getattr(mailer_service, name)):
            mocks[name] = MagicMock(return_value=True)
            monkeypatch.setattr(mailer_service, name, mocks[name])
    return mocks


# ─── 5. Fichiers d'export isolés ──────────────────────────────────────────────
@pytest.fixture(autouse=True)
def export_dirs(tmp_path, monkeypatch):
    """Redirige exports privés, cache d'impression et log debug vers tmp_path."""
    from app.api.v1.endpoints import exports

    static_dir = tmp_path / "static"
    private_dir = tmp_path / "private_exports"
    cache_dir = static_dir / "cache"
    for d in (static_dir, private_dir, cache_dir):
        d.mkdir(parents=True, exist_ok=True)

    monkeypatch.setattr(exports, "STATIC_DIR", static_dir)
    monkeypatch.setattr(exports, "PRIVATE_EXPORTS_DIR", private_dir)
    monkeypatch.setattr(exports, "CACHE_DIR", cache_dir)
    return {"root": tmp_path, "static": static_dir, "private": private_dir, "cache": cache_dir}


# ─── 6. Rate limiting ─────────────────────────────────────────────────────────
@pytest.fixture(autouse=True)
def _disable_rate_limit():
    limiter.enabled = False
    yield
    limiter.enabled = False


@pytest.fixture
def rate_limited():
    """Réactive le rate limiter (compteurs remis à zéro) pour un test donné."""
    limiter.reset()
    limiter.enabled = True
    yield limiter
    limiter.enabled = False
    limiter.reset()


# ─── 7. Client HTTP ───────────────────────────────────────────────────────────
@pytest.fixture(scope="function")
def client(db_session):
    """Client FastAPI branché sur la session de test, sans services d'arrière-plan."""
    from app.services.cleanup_service import cleanup_service

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with patch.object(cleanup_service, "start"), patch.object(cleanup_service, "stop"):
        with TestClient(app) as c:
            yield c
    app.dependency_overrides.clear()


# ─── 8. Fabriques de données ──────────────────────────────────────────────────
@pytest.fixture
def make_user(db_session):
    counter = {"n": 0}

    def _make(
        role: UserRole = UserRole.USER,
        *,
        email: str | None = None,
        password: str = DEFAULT_PASSWORD,
        is_active: bool = True,
        premium_days: int | None = None,
        **extra,
    ) -> User:
        counter["n"] += 1
        user = User(
            email=email or f"{role.value}{counter['n']}@test.carriey",
            full_name=f"Test {role.value} {counter['n']}",
            hashed_password=get_password_hash(password),
            role=role,
            is_active=is_active,
            token_version=1,
            premium_until=(datetime.now() + timedelta(days=premium_days)) if premium_days else None,
            **extra,
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        return user

    return _make


def token_for(user: User, **claims) -> str:
    data = {"sub": user.email, "purpose": "access", "token_version": user.token_version}
    data.update(claims)
    return create_access_token(data=data, expires_delta=timedelta(minutes=30))


def headers_for(user: User, **claims) -> dict:
    return {"Authorization": f"Bearer {token_for(user, **claims)}"}


@pytest.fixture
def make_template(db_session):
    counter = {"n": 0}

    def _make(price: float = 1500.0, *, slug: str | None = None, is_active: bool = True) -> Template:
        counter["n"] += 1
        slug = slug or f"tpl-{counter['n']}-{int(price)}"
        template = Template(
            name=f"Template {slug}",
            slug=slug,
            price=price,
            folder_name=slug,
            definition={},
            is_active=is_active,
        )
        db_session.add(template)
        db_session.commit()
        db_session.refresh(template)
        return template

    return _make


@pytest.fixture
def make_payment(db_session):
    def _make(
        user: User,
        template: Template | None = None,
        *,
        amount: float | None = None,
        status: PaymentStatus = PaymentStatus.PENDING,
        provider: PaymentProvider = PaymentProvider.FEDAPAY,
        provider_payment_id: str | None = None,
        plan_code: str | None = None,
    ) -> Payment:
        payment = Payment(
            user_id=user.id,
            template_id=template.id if template else None,
            plan_code=plan_code,
            amount=amount if amount is not None else (template.price if template else 1000),
            currency="XOF",
            provider=provider,
            provider_payment_id=provider_payment_id,
            status=status,
        )
        db_session.add(payment)
        db_session.commit()
        db_session.refresh(payment)
        return payment

    return _make


@pytest.fixture
def pdf_service():
    """Simule le microservice PDF distant (Render). Retourne le mock httpx."""

    class _FakeResponse:
        status_code = 200
        content = b"%PDF-1.4 fake test pdf" + b"0" * 2048
        text = "ok"

        def raise_for_status(self):
            pass

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = _FakeResponse()
        yield mock_post


@pytest.fixture
def fedapay_webhook_headers():
    return {"Feda_WebHook_Key": settings.FEDA_WEBHOOK_KEY}


__all__ = ["API", "DEFAULT_PASSWORD", "token_for", "headers_for", "NetworkBlockedError", "timezone"]
