"""
Routes admin pour la gestion des utilisateurs
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.auth import UserOut
from middleware.admin_deps import get_current_admin_user, get_current_super_admin_user
from pydantic import BaseModel

router = APIRouter()

class UserRoleUpdate(BaseModel):
    role: UserRole

class UserStatusUpdate(BaseModel):
    is_active: bool

@router.get("/", response_model=List[UserOut])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[UserRole] = Query(None, description="Filtrer par rôle"),
    is_active: Optional[bool] = Query(None, description="Filtrer par statut actif"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Liste tous les utilisateurs (admin uniquement)
    Supporte les filtres par rôle et statut
    """
    query = db.query(User)
    
    if role is not None:
        query = query.filter(User.role == role)
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    users = query.offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=UserOut)
async def get_user_details(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Récupère les détails d'un utilisateur"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    return user

@router.put("/{user_id}/role", response_model=UserOut)
async def update_user_role(
    user_id: str,
    role_update: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_super_admin_user)  # Seul super_admin peut changer les rôles
):
    """
    Change le rôle d'un utilisateur (super_admin uniquement)
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    # Empêcher de modifier son propre rôle
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez pas modifier votre propre rôle"
        )
    
    user.role = role_update.role
    db.commit()
    db.refresh(user)
    
    return user

@router.put("/{user_id}/toggle", response_model=UserOut)
async def toggle_user_status(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Active/désactive un utilisateur"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    # Empêcher de se désactiver soi-même
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez pas désactiver votre propre compte"
        )
    
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_super_admin_user)  # Seul super_admin peut supprimer
):
    """Supprime un utilisateur (super_admin uniquement)"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    # Empêcher de se supprimer soi-même
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez pas supprimer votre propre compte"
        )
    
    from app.services.user_account_service import delete_user_account_and_data
    delete_user_account_and_data(db, user)
    
    return None
