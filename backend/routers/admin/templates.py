"""
Routes admin pour la gestion des templates
"""
from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.template import Template
from schemas.template import (
    TemplateCreate, 
    TemplateUpdate, 
    TemplateOut, 
    TemplateListOut,
    TemplateSyncResult
)
from middleware.admin_deps import get_current_admin_user
from services.template_sync_service import TemplateSyncService

router = APIRouter()

# Configuration
TEMPLATES_DIR = Path(__file__).parent.parent.parent / "templates"

@router.get("/", response_model=List[TemplateListOut])
async def list_all_templates(
    skip: int = 0,
    limit: int = 100,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Liste tous les templates (admin uniquement)
    Inclut les templates inactifs si include_inactive=true
    """
    query = db.query(Template)
    
    if not include_inactive:
        query = query.filter(Template.is_active == True)
    
    templates = query.offset(skip).limit(limit).all()
    
    # Ajouter le champ is_free
    result = []
    for template in templates:
        template_dict = {
            "id": template.id,
            "slug": template.slug,
            "name": template.name,
            "description": template.description,
            "price": template.price,
            "currency": template.currency,
            "preview_image": template.preview_image,
            "is_active": template.is_active,
            "is_free": template.price == 0,
            "user_has_access": None  # Admin a accès à tout
        }
        result.append(TemplateListOut(**template_dict))
    
    return result

@router.get("/{template_id}", response_model=TemplateOut)
async def get_template_details(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Récupère les détails complets d'un template"""
    template = db.query(Template).filter(Template.id == template_id).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template non trouvé"
        )
    
    # Convertir en dict et ajouter les champs calculés
    template_dict = {
        "id": template.id,
        "slug": template.slug,
        "name": template.name,
        "description": template.description,
        "price": template.price,
        "currency": template.currency,
        "folder_name": template.folder_name,
        "definition": template.definition,
        "json_schema": template.json_schema,
        "version": template.version,
        "is_active": template.is_active,
        "is_system": template.is_system,
        "preview_image": template.preview_image,
        "created_by": template.created_by,
        "created_at": template.created_at,
        "updated_at": template.updated_at,
        "is_free": template.price == 0,
        "user_has_access": None
    }
    
    return TemplateOut(**template_dict)

@router.post("/", response_model=TemplateOut, status_code=status.HTTP_201_CREATED)
async def create_template(
    template_in: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Crée un nouveau template (admin uniquement)"""
    
    # Vérifier si le slug existe déjà
    existing = db.query(Template).filter(Template.slug == template_in.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Un template avec le slug '{template_in.slug}' existe déjà"
        )
    
    # Créer le template
    db_template = Template(
        **template_in.model_dump(),
        created_by=current_user.id
    )
    
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    
    # Convertir en dict et ajouter les champs calculés
    template_dict = {
        "id": db_template.id,
        "slug": db_template.slug,
        "name": db_template.name,
        "description": db_template.description,
        "price": db_template.price,
        "currency": db_template.currency,
        "folder_name": db_template.folder_name,
        "definition": db_template.definition,
        "json_schema": db_template.json_schema,
        "version": db_template.version,
        "is_active": db_template.is_active,
        "is_system": db_template.is_system,
        "preview_image": db_template.preview_image,
        "created_by": db_template.created_by,
        "created_at": db_template.created_at,
        "updated_at": db_template.updated_at,
        "is_free": db_template.price == 0,
        "user_has_access": None
    }
    
    return TemplateOut(**template_dict)

@router.put("/{template_id}", response_model=TemplateOut)
async def update_template(
    template_id: str,
    template_in: TemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Met à jour un template (admin uniquement)"""
    
    template = db.query(Template).filter(Template.id == template_id).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template non trouvé"
        )
    
    # Empêcher la modification de certains champs pour les templates système
    if template.is_system and template_in.is_system is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Impossible de retirer le statut système d'un template"
        )
    
    # Mettre à jour les champs
    update_data = template_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(template, field, value)
    
    db.commit()
    db.refresh(template)
    
    # Convertir en dict et ajouter les champs calculés
    template_dict = {
        "id": template.id,
        "slug": template.slug,
        "name": template.name,
        "description": template.description,
        "price": template.price,
        "currency": template.currency,
        "folder_name": template.folder_name,
        "definition": template.definition,
        "json_schema": template.json_schema,
        "version": template.version,
        "is_active": template.is_active,
        "is_system": template.is_system,
        "preview_image": template.preview_image,
        "created_by": template.created_by,
        "created_at": template.created_at,
        "updated_at": template.updated_at,
        "is_free": template.price == 0,
        "user_has_access": None
    }
    
    return TemplateOut(**template_dict)

@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Supprime un template (admin uniquement)"""
    
    template = db.query(Template).filter(Template.id == template_id).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template non trouvé"
        )
    
    # Empêcher la suppression des templates système
    if template.is_system:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Impossible de supprimer un template système"
        )
    
    db.delete(template)
    db.commit()
    
    return None

@router.post("/{template_id}/toggle", response_model=TemplateOut)
async def toggle_template_status(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Active/désactive un template"""
    
    template = db.query(Template).filter(Template.id == template_id).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template non trouvé"
        )
    
    template.is_active = not template.is_active
    db.commit()
    db.refresh(template)
    
    # Convertir en dict et ajouter les champs calculés
    template_dict = {
        "id": template.id,
        "slug": template.slug,
        "name": template.name,
        "description": template.description,
        "price": template.price,
        "currency": template.currency,
        "folder_name": template.folder_name,
        "definition": template.definition,
        "json_schema": template.json_schema,
        "version": template.version,
        "is_active": template.is_active,
        "is_system": template.is_system,
        "preview_image": template.preview_image,
        "created_by": template.created_by,
        "created_at": template.created_at,
        "updated_at": template.updated_at,
        "is_free": template.price == 0,
        "user_has_access": None
    }
    
    return TemplateOut(**template_dict)

@router.post("/sync", response_model=TemplateSyncResult)
async def sync_templates_from_filesystem(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Synchronise les templates depuis le filesystem vers la base de données"""
    
    sync_service = TemplateSyncService(TEMPLATES_DIR)
    result = sync_service.sync_templates(db)
    
    return TemplateSyncResult(**result)
