from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.template import Template
from app.schemas.template import TemplateListOut, TemplateOut
from app.api.dependencies import get_current_active_user
from app.schemas.auth import UserOut
from app.services.template_access_service import TemplateAccessService
from app.models.user_template_access import UserTemplateAccess

router = APIRouter()

@router.get("/my-access")
async def get_my_template_access(
    current_user: UserOut = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Retourne les templates auxquels l'utilisateur connecté a accès (achetés/essais)"""
    accesses = db.query(UserTemplateAccess).filter(
        UserTemplateAccess.user_id == current_user.id
    ).all()
    
    result = []
    for access in accesses:
        template = db.query(Template).filter(Template.id == access.template_id).first()
        if template:
            result.append({
                "id": access.id,
                "template_id": template.id,
                "template_name": template.name,
                "template_slug": template.slug,
                "granted_at": str(access.granted_at) if access.granted_at else None,
                "expires_at": str(access.expires_at) if access.expires_at else None,
                "is_expired": access.expires_at is not None and access.expires_at < __import__('datetime').datetime.now(),
                "plan": "trial" if access.expires_at else "permanent"
            })
    return result

@router.get("", response_model=List[TemplateListOut])
async def list_active_templates(
    db: Session = Depends(get_db)
):
    """Liste tous les templates actifs (accès public)"""
    templates = db.query(Template).filter(Template.is_active == True).all()
    return templates

from app.models.user import User
from datetime import datetime, timezone

@router.get("/{id_or_slug}/check-access")
async def check_template_access(
    id_or_slug: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Vérifie si l'utilisateur connecté a accès à un template"""
    template = db.query(Template).filter(
        (Template.id == id_or_slug) | (Template.slug == id_or_slug),
        Template.is_active == True
    ).first()
    
    if not template:
        # Template non trouvé dans la base = template legacy hardcodé (gratuit par défaut)
        return {
            "has_access": True,
            "is_free": True,
            "template_id": id_or_slug,
            "template_name": id_or_slug,
            "template_price": "0",
            "template_currency": "XOF"
        }
    
    is_free = template.price == 0
    is_premium = current_user.premium_until and current_user.premium_until.replace(tzinfo=timezone.utc) > datetime.now(timezone.utc)
    has_access = is_free or is_premium or TemplateAccessService.check_user_access(db, current_user.id, template.id)
    
    return {
        "has_access": has_access,
        "is_free": is_free,
        "template_id": template.id,
        "template_name": template.name,
        "template_price": str(template.price),
        "template_currency": template.currency or "XOF"
    }

@router.get("/{id_or_slug}", response_model=TemplateOut)
async def get_template(
    id_or_slug: str,
    db: Session = Depends(get_db)
):
    """Récupère un template par son ID ou son slug (accès public)"""
    template = db.query(Template).filter(
        (Template.id == id_or_slug) | (Template.slug == id_or_slug),
        Template.is_active == True
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template non trouvé")
    
    return template
