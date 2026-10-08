from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, field_validator
from typing import Any, Optional
import logging
import os

from app.schemas import auth as schemas
from app.core import security as utils
from app.api.dependencies import get_current_user, get_current_active_user
from app.models.user import User, UserRole
from app.db.session import get_db
from app.utils.audit import log_audit

router = APIRouter()
logger = logging.getLogger(__name__)


# --- Schemas locaux ---
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

def validate_password_complexity(v: str) -> str:
    if len(v) < 8:
        raise ValueError("Le mot de passe doit faire au moins 8 caractères.")
    if not any(char.isdigit() for char in v):
        raise ValueError("Le mot de passe doit contenir au moins un chiffre.")
    if not any(char.isupper() for char in v):
        raise ValueError("Le mot de passe doit contenir au moins une lettre majuscule.")
    return v

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        return validate_password_complexity(v)

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        return validate_password_complexity(v)


from app.core.limiter import limiter
from fastapi import Request

@router.post("/login", response_model=schemas.Token)
@limiter.limit("10/minute")
async def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Any:
    """Endpoint pour se connecter et obtenir un token JWT"""
    # Rechercher l'utilisateur dans la base de données
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Vérifier le mot de passe
    if not utils.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Vérifier que le compte est actif
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Compte désactivé"
        )
    
    # Créer un token d'accès
    access_token_expires = timedelta(minutes=utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = utils.create_access_token(
        data={"sub": user.email, "token_version": user.token_version}, 
        expires_delta=access_token_expires
    )

    # Log audit
    log_audit(db, user.id, "login", "user", user.id, {"email": user.email})
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserOut)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Endpoint pour récupérer les informations de l'utilisateur connecté"""
    return current_user

@router.post("/register", response_model=schemas.UserOut)
@limiter.limit("5/minute")
async def register_user(request: Request, user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    """Endpoint pour enregistrer un nouvel utilisateur"""
    # Vérifier que l'email n'est pas déjà utilisé
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Cet email est déjà utilisé"
        )
    
    # Hacher le mot de passe
    hashed_password = utils.get_password_hash(user_in.password)
    
    # Créer l'utilisateur
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        role=UserRole.USER,  # Par défaut, nouveau user = role 'user'
        is_active=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log audit
    log_audit(db, new_user.id, "register", "user", new_user.id, {"email": new_user.email})

    # Email de bienvenue (non-bloquant)
    try:
        from app.services.mailer_service import mailer_service
        mailer_service.send_welcome_register(
            recipient_email=new_user.email,
            full_name=new_user.full_name or new_user.email
        )
    except Exception as e:
        logger.error(f"[Register] Email de bienvenue échoué: {e}")
    
    return new_user


def _send_reset_email_task(email: str, name: str, link: str):
    try:
        from app.services.mailer_service import mailer_service
        mailer_service.send_password_reset(recipient_email=email, full_name=name, reset_link=link)
        logger.info(f"[Auth] Email envoyé à {email}")
    except Exception as e:
        logger.error(f"[Auth] Erreur email: {e}")

@router.post("/forgot-password")
@limiter.limit("3/minute")
async def forgot_password(request: Request, req: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Envoie un email de réinitialisation de mot de passe"""
    # Réponse identique qu'il existe ou non pour éviter l'enumération
    user = db.query(User).filter(User.email == req.email).first()
    
    if user:
        reset_token = utils.create_access_token(
            data={"sub": user.email, "purpose": "reset_password", "token_version": user.token_version},
            expires_delta=timedelta(hours=1)
        )
        frontend_url = os.getenv("FRONTEND_URL")
        if not frontend_url and os.getenv("ENVIRONMENT", "development").lower() == "production":
            raise HTTPException(status_code=500, detail="Configuration serveur invalide (FRONTEND_URL manquant en production)")
        frontend_url = frontend_url or "http://localhost:5000"
        reset_link = f"{frontend_url}/set-password?token={reset_token}"
        
        # Audit log s'exécute vite, l'envoi de mail est mis en file d'attente (évite l'énumération par attaque temporelle)
        log_audit(db, user.id, "forgot_password", "user", user.id, {"email": user.email})

        background_tasks.add_task(
            _send_reset_email_task,
            email=user.email,
            name=user.full_name or user.email,
            link=reset_link
        )

    return {"message": "Si cet email existe, un lien de réinitialisation a été envoyé."}

@router.post("/magic-link")
@limiter.limit("3/minute")
async def magic_link(request: Request, req: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Envoie un lien de connexion magique"""
    user = db.query(User).filter(User.email == req.email).first()
    
    if user:
        reset_token = utils.create_access_token(
            data={"sub": user.email, "purpose": "reset_password", "token_version": user.token_version},
            expires_delta=timedelta(hours=24)
        )
        frontend_url = os.getenv("FRONTEND_URL")
        if not frontend_url and os.getenv("ENVIRONMENT", "development").lower() == "production":
            raise HTTPException(status_code=500, detail="FRONTEND_URL manquant en production")
        frontend_url = frontend_url or "http://localhost:5000"
        reset_link = f"{frontend_url}/set-password?token={reset_token}"
        
        log_audit(db, user.id, "magic_link", "user", user.id, {"email": user.email})

        background_tasks.add_task(
            _send_reset_email_task,
            email=user.email,
            name=user.full_name or user.email,
            link=reset_link
        )

    # L'envoi de mail étant asynchrone, la réponse est toujours immédiate (protège contre les attaques temporelles)
    return {"message": "Si cet email existe, un lien magique a été envoyé."}


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Réinitialise le mot de passe via un token (forgot-password ou guest setup)"""
    from jose import jwt, JWTError
    try:
        payload = jwt.decode(req.token, utils.SECRET_KEY, algorithms=[utils.ALGORITHM])
        email = payload.get("sub")
        purpose = payload.get("purpose")
        
        if not email or purpose not in ("reset_password", "setup_password"):
            raise HTTPException(status_code=400, detail="Token invalide ou expiré")
            
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
            
        user.hashed_password = utils.get_password_hash(req.new_password)
        # Invalider tous les anciens tokens
        user.token_version = (user.token_version or 1) + 1
        db.commit()
        
        log_audit(db, user.id, "reset_password", "user", user.id, {})
        return {"message": "Mot de passe réinitialisé avec succès"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Lien invalide ou expiré")


@router.post("/change-password")
async def change_password(
    req: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Change le mot de passe d'un utilisateur connecté"""
    if not utils.verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Mot de passe actuel incorrect")
    
    current_user.hashed_password = utils.get_password_hash(req.new_password)
    # Invalider tous les anciens tokens (déconnexion de tous les autres appareils)
    current_user.token_version = (current_user.token_version or 1) + 1
    db.commit()
    
    log_audit(db, current_user.id, "change_password", "user", current_user.id, {})
    return {"message": "Mot de passe modifié avec succès"}


@router.put("/profile")
async def update_profile(
    full_name: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Met à jour le profil de l'utilisateur connecté"""
    if full_name is not None:
        current_user.full_name = full_name
    db.commit()
    db.refresh(current_user)
    log_audit(db, current_user.id, "update_profile", "user", current_user.id, {})
    return current_user
