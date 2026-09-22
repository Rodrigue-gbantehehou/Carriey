from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Any, Optional

from auth import schemas, utils
from auth.deps import get_current_user, get_current_active_user
from models.user import User, UserRole
from database import get_db
from utils.audit import log_audit

router = APIRouter(prefix="/auth", tags=["auth"])


# --- Schemas locaux ---
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/login", response_model=schemas.Token)
async def login_for_access_token(
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
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    # Log audit
    log_audit(db, user.id, "login", "user", user.id, {"email": user.email})
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserOut)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Endpoint pour récupérer les informations de l'utilisateur connecté"""
    return current_user

@router.post("/register", response_model=schemas.UserOut)
async def register_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
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
        from services.mailer_service import mailer_service
        mailer_service.send_welcome_register(
            recipient_email=new_user.email,
            full_name=new_user.full_name or new_user.email
        )
    except Exception as e:
        print(f"[Register] Email de bienvenue échoué: {e}")
    
    return new_user


@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Envoie un email de réinitialisation de mot de passe"""
    # Réponse identique qu'il existe ou non pour éviter l'enumération
    user = db.query(User).filter(User.email == req.email).first()
    
    if user:
        reset_token = utils.create_access_token(
            data={"sub": user.email, "purpose": "reset_password"},
            expires_delta=timedelta(hours=1)
        )
        import os
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5000")
        reset_link = f"{frontend_url}/set-password?token={reset_token}"
        
        try:
            from services.mailer_service import mailer_service
            mailer_service.send_password_reset(
                recipient_email=user.email,
                full_name=user.full_name or user.email,
                reset_link=reset_link
            )
            print(f"[ForgotPassword] Email envoyé à {user.email}")
        except Exception as e:
            print(f"[ForgotPassword] Erreur email: {e}")

        log_audit(db, user.id, "forgot_password", "user", user.id, {"email": user.email})

    return {"message": "Si cet email existe, un lien de réinitialisation a été envoyé."}


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
        
        if len(req.new_password) < 6:
            raise HTTPException(status_code=400, detail="Le mot de passe doit faire au moins 6 caractères")
            
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
            
        user.hashed_password = utils.get_password_hash(req.new_password)
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
    
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Le nouveau mot de passe doit faire au moins 6 caractères")
    
    current_user.hashed_password = utils.get_password_hash(req.new_password)
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
