"""
Dépendances pour les routes admin
"""
from fastapi import Depends, HTTPException, status
from auth.deps import get_current_user
from models.user import User, UserRole

async def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Vérifie que l'utilisateur actuel est un admin ou super_admin
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès refusé. Droits administrateur requis."
        )
    return current_user

async def get_current_super_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Vérifie que l'utilisateur actuel est un super_admin
    """
    if current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès refusé. Droits super administrateur requis."
        )
    return current_user
