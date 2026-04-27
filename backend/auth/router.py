from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Any

from auth import schemas, utils
from auth.deps import get_current_user, get_current_active_user
from models.user import User, UserRole
from database import get_db
from utils.audit import log_audit

router = APIRouter(prefix="/auth", tags=["auth"])

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
    
    return new_user

