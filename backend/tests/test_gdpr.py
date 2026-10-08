import uuid
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.models.profile import MasterProfile, Experience, Skill
from app.models.resume import Resume
from app.models.candidature import Candidature, CandidatureStatus
from app.models.payment import Payment, PaymentProvider, PaymentStatus
from app.core.security import get_password_hash, create_access_token
from app.services.user_account_service import export_user_gdpr_data, delete_user_account_and_data

BASE_DIR = Path(__file__).resolve().parents[1]

def test_gdpr_service_export_and_deletion(db_session: Session):
    """Teste le service d'export et d'effacement complet RGPD avec vérification des fichiers."""
    test_email = f"gdpr_service_{uuid.uuid4().hex[:8]}@carriey.com"
    user = User(
        email=test_email,
        hashed_password=get_password_hash("TestPass123!"),
        full_name="Jean Dupont RGPD",
        role=UserRole.USER,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    user_id = user.id

    # Master Profile
    profile = MasterProfile(
        user_id=user_id,
        first_name="Jean",
        last_name="Dupont",
        title="Ingénieur DevOps",
        contact_email=test_email
    )
    db_session.add(profile)
    db_session.commit()
    db_session.refresh(profile)

    exp = Experience(profile_id=profile.id, title="DevOps", company="Corp", current=True)
    skill = Skill(profile_id=profile.id, name="Docker")
    resume = Resume(user_id=user_id, title="CV Cloud", content={"summary": "DevOps"})
    candidature = Candidature(user_id=user_id, company="Amazon", role="DevOps", status=CandidatureStatus.ENVOYEE)
    payment = Payment(user_id=user_id, provider=PaymentProvider.KKIAPAY, amount=5000, currency="XOF", status=PaymentStatus.SUCCESS)
    db_session.add_all([exp, skill, resume, candidature, payment])
    db_session.commit()

    # Création de fichiers physiques de test
    photos_dir = BASE_DIR / "private_uploads" / "photos"
    photos_dir.mkdir(parents=True, exist_ok=True)
    photo_file = photos_dir / f"{user_id}_{uuid.uuid4().hex[:8]}.jpg"
    photo_file.write_text("TEST_PHOTO_BYTES", encoding="utf-8")

    exports_dir = BASE_DIR / "private_exports"
    exports_dir.mkdir(parents=True, exist_ok=True)
    export_file = exports_dir / f"carriey_export_{user_id[:8]}_test.json"
    export_file.write_text("TEST_EXPORT_JSON", encoding="utf-8")

    assert photo_file.exists()
    assert export_file.exists()

    # 1. Test Export RGPD
    export_data = export_user_gdpr_data(db=db_session, user=user)
    assert export_data["metadata"]["platform"] == "Carriey"
    assert export_data["user_account"]["email"] == test_email
    assert export_data["master_profile"]["first_name"] == "Jean"
    assert len(export_data["resumes_and_documents"]) >= 1
    assert len(export_data["candidatures"]) >= 1
    assert len(export_data["payment_history"]) >= 1

    # 2. Test Suppression de compte et purge des fichiers
    del_result = delete_user_account_and_data(db=db_session, user=user)
    assert del_result["status"] == "success"

    # Vérification que les fichiers ont été supprimés physiquement
    assert not photo_file.exists(), "La photo de profil devrait être supprimée physiquement"
    assert not export_file.exists(), "Le fichier exporté devrait être supprimé physiquement"

    # Vérification que la base de données est purgée
    assert db_session.query(User).filter(User.id == user_id).first() is None
    assert db_session.query(MasterProfile).filter(MasterProfile.user_id == user_id).first() is None
    assert db_session.query(Resume).filter(Resume.user_id == user_id).count() == 0
    assert db_session.query(Candidature).filter(Candidature.user_id == user_id).count() == 0
    assert db_session.query(Payment).filter(Payment.user_id == user_id).count() == 0


def test_gdpr_api_endpoints(client: TestClient, db_session: Session):
    """Teste les endpoints HTTP /api/v1/exports/data et /api/v1/auth/me."""
    test_email = f"gdpr_api_{uuid.uuid4().hex[:8]}@carriey.com"
    pwd = "ValidPassword123!"
    user = User(
        email=test_email,
        hashed_password=get_password_hash(pwd),
        full_name="Alice API",
        role=UserRole.USER,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    token = create_access_token(data={"sub": test_email, "token_version": 1, "purpose": "access"})
    headers = {"Authorization": f"Bearer {token}"}

    # Test Export endpoint
    res_export = client.get("/api/v1/exports/data", headers=headers)
    assert res_export.status_code == 200
    export_json = res_export.json()
    assert export_json["metadata"]["platform"] == "Carriey"
    assert "carriey_export_" in res_export.headers.get("content-disposition", "")

    # Test Deletion avec mauvais mot de passe
    res_del_bad = client.request("DELETE", "/api/v1/auth/me", headers=headers, json={"password": "FauxMotDePasse"})
    assert res_del_bad.status_code == 400

    # Test Deletion valide avec confirmation SUPPRIMER
    res_del_ok = client.request("DELETE", "/api/v1/auth/me", headers=headers, json={"confirmation": "SUPPRIMER"})
    assert res_del_ok.status_code == 200
    assert res_del_ok.json()["status"] == "success"

    # Vérification utilisateur inexistant
    assert db_session.query(User).filter(User.id == user.id).first() is None
