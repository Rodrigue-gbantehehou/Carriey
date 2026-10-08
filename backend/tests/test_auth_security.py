import pytest
from datetime import timedelta
from jose import jwt

from app.core.security import create_access_token, get_password_hash
from app.models.user import User

@pytest.fixture
def test_user(db_session):
    user = User(
        email="security_test@example.com",
        hashed_password=get_password_hash("password123"),
        token_version=1
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

def test_token_expiration(client, db_session):
    """Teste si un token expiré est refusé"""
    # Create an expired token manually
    expired_token = create_access_token(
        data={"sub": "security_test@example.com", "purpose": "access", "token_version": 1},
        expires_delta=timedelta(minutes=-1)  # Already expired
    )
    
    headers = {"Authorization": f"Bearer {expired_token}"}
    response = client.get("/api/profile/me", headers=headers)
    assert response.status_code == 401
    assert "Impossible de valider les identifiants" in response.json()["detail"]


def test_reset_token_rejected_on_protected_route(client, test_user):
    """Teste si un token 'reset_password' est refusé sur une route protégée (AUTH-001)"""
    reset_token = create_access_token(
        data={"sub": test_user.email, "purpose": "reset_password", "token_version": test_user.token_version},
        expires_delta=timedelta(hours=1)
    )
    
    headers = {"Authorization": f"Bearer {reset_token}"}
    # `/api/auth/me` verifies normal `get_current_user` dependency
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 401
    assert "Impossible de valider les identifiants" in response.json()["detail"]


def test_token_reuse_after_password_change(client, test_user, db_session):
    """Teste si un token d'accès devient invalide après changement de mot de passe (AUTH-002)"""
    # 1. Obtenir un token valide
    valid_token = create_access_token(
        data={"sub": test_user.email, "purpose": "access", "token_version": test_user.token_version},
        expires_delta=timedelta(minutes=30)
    )
    
    headers = {"Authorization": f"Bearer {valid_token}"}
    
    # 2. Vérifier que l'accès fonctionne
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    
    # 3. Changer le mot de passe (simule la route de reset ou change)
    test_user.token_version += 1
    db_session.commit()
    
    # 4. Vérifier que le MÊME token est désormais refusé (révocation)
    response_after = client.get("/api/auth/me", headers=headers)
    assert response_after.status_code == 401
    assert "Session expirée" in response_after.json()["detail"]
