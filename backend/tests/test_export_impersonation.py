import pytest
from fastapi import HTTPException
from app.models.user import User
from app.core.security import get_password_hash
from app.api.v1.endpoints.exports import _get_or_create_export_user, ExportRequest

@pytest.fixture
def existing_user(db_session):
    user = User(
        email="real_user@example.com",
        hashed_password=get_password_hash("password123"),
        token_version=1
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.mark.anyio
async def test_export_impersonation_blocked(existing_user, db_session):
    """
    Test qu'un invité ne peut pas utiliser l'email d'un compte existant pour un export.
    (Si guest_email correspond à un compte existant : exiger authentification.)
    """
    req = ExportRequest(
        template_name="free-template",
        guest_email=existing_user.email,
        data={}
    )
    
    with pytest.raises(HTTPException) as excinfo:
        await _get_or_create_export_user(req, current_user=None, db=db_session)
        
    assert excinfo.value.status_code == 401
    assert "Cet email est déjà associé à un compte" in excinfo.value.detail


@pytest.mark.anyio
async def test_export_guest_success_with_new_email(db_session):
    """
    Test qu'un invité peut exporter avec un email non existant. (Email inexistant)
    """
    req = ExportRequest(
        template_name="free-template",
        guest_email="new_guest@example.com",
        data={}
    )
    
    # Doit réussir et retourner is_new_user=True
    target_user_id, is_new_user, setup_token = await _get_or_create_export_user(req, current_user=None, db=db_session)
    
    assert target_user_id is not None
    assert is_new_user is True
    assert setup_token is not None
    
    # Vérifier en DB
    user = db_session.query(User).filter(User.email == "new_guest@example.com").first()
    assert user is not None
    assert user.id == target_user_id


@pytest.mark.anyio
async def test_export_authenticated_user_success(existing_user, db_session):
    """
    Test qu'un utilisateur connecté peut exporter avec son propre compte. (Utilisateur connecté)
    """
    req = ExportRequest(
        template_name="free-template",
        data={}
    )
    
    # Doit réussir sans créer de nouvel utilisateur
    target_user_id, is_new_user, setup_token = await _get_or_create_export_user(req, current_user=existing_user, db=db_session)
    
    assert target_user_id == existing_user.id
    assert is_new_user is False
    assert setup_token is None
