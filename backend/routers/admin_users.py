from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.user import User, UserRole
from auth.deps import get_current_super_admin
from auth.schemas import UserOut

router = APIRouter(prefix="/admin/users", tags=["admin"])

@router.get("/", response_model=List[UserOut])
async def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_super_admin)
):
    """Liste tous les utilisateurs (Super Admin uniquement)"""
    return db.query(User).all()

@router.patch("/{user_id}/role")
async def update_user_role(
    user_id: str,
    new_role: UserRole,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_super_admin)
):
    """Change le rôle d'un utilisateur"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    user.role = new_role
    db.commit()
    return {"message": f"Rôle de {user.email} mis à jour vers {new_role}"}

@router.patch("/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_super_admin)
):
    """Active ou désactive un compte utilisateur"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    user.is_active = not user.is_active
    db.commit()
    return {"is_active": user.is_active}
