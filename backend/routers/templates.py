from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.template import Template
from schemas.template import TemplateListOut, TemplateOut

router = APIRouter(prefix="/templates", tags=["templates"])

@router.get("/", response_model=List[TemplateListOut])
async def list_active_templates(
    db: Session = Depends(get_db)
):
    """Liste tous les templates actifs (accès public)"""
    templates = db.query(Template).filter(Template.is_active == True).all()
    return templates

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
