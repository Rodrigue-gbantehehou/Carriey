from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.resume import Resume, ResumeStatus
from app.models.template import Template
from app.models.payment import Payment, PaymentStatus
from app.schemas.resume import ResumeCreate, ResumeUpdate, ResumeOut, ResumeListOut
from app.api.dependencies import get_current_active_user
from app.services.template_access_service import TemplateAccessService

router = APIRouter()

def verify_template_access(user: User, template_id: str, db: Session) -> bool:
    """Vérifie si l'utilisateur a accès au template (gratuit, payé ou admin)"""
    # Les admins ont accès total
    if getattr(user, 'role', None) in [UserRole.ADMIN, UserRole.SUPER_ADMIN, "admin", "super_admin"]:
        return True
    
    template = db.query(Template).filter(
        (Template.id == template_id) | (Template.slug == template_id)
    ).first()
    if not template:
        return True # Laisser sauvegarder le brouillon par défaut
    
    # Si gratuit, accès direct
    if template.price == 0:
        return True
    
    # Vérifier via le service d'accès
    return TemplateAccessService.check_user_access(db, user.id, template.id)

@router.get("/", response_model=List[ResumeListOut])
async def list_resumes(
    skip: int = 0,
    limit: int = 100,
    doc_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Liste tous les documents de l'utilisateur (filtrable par doc_type)"""
    query = db.query(Resume).filter(Resume.user_id == current_user.id)
    if doc_type:
        query = query.filter(Resume.doc_type == doc_type)
        
    resumes = query.order_by(Resume.created_at.desc()).offset(skip).limit(limit).all()
    
    # Resolve any UUID template_ids to slugs in batch to avoid N+1 queries
    template_ids = list({r.template_id for r in resumes if r.template_id})
    template_map = {}
    if template_ids:
        templates = db.query(Template).filter(
            (Template.id.in_(template_ids)) | (Template.slug.in_(template_ids))
        ).all()
        template_map = {t.id: t for t in templates}
        template_map.update({t.slug: t for t in templates if t.slug})

    result = []
    for r in resumes:
        r_dict = {
            "id": r.id,
            "title": r.title,
            "template_id": r.template_id,
            "status": r.status.value if hasattr(r.status, "value") else r.status,
            "doc_type": r.doc_type.value if hasattr(r.doc_type, "value") else r.doc_type,
            "linked_doc_id": r.linked_doc_id,
            "content": r.content,
            "created_at": r.created_at,
            "updated_at": r.updated_at
        }
        if r.template_id:
            template = template_map.get(r.template_id)
            if template and template.slug:
                r_dict["template_id"] = template.slug
        result.append(r_dict)
    
    return result

@router.get("/{resume_id}", response_model=ResumeOut)
async def get_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Récupère un CV spécifique"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="CV non trouvé")
    
    # Convert to dict to avoid mutating DB
    r_dict = {
        "id": resume.id,
        "title": resume.title,
        "template_id": resume.template_id,
        "status": resume.status.value if hasattr(resume.status, "value") else resume.status,
        "doc_type": resume.doc_type.value if hasattr(resume.doc_type, "value") else resume.doc_type,
        "linked_doc_id": resume.linked_doc_id,
        "content": resume.content,
        "user_id": resume.user_id,
        "created_at": resume.created_at,
        "updated_at": resume.updated_at
    }

    # Resolve template_id: if it's a UUID, convert to slug for the frontend
    if resume.template_id:
        template = db.query(Template).filter(
            (Template.id == resume.template_id) | (Template.slug == resume.template_id)
        ).first()
        if template and template.slug:
            r_dict["template_id"] = template.slug
            
    return r_dict

from fastapi import Request

from pydantic import ValidationError
from app.models.resume import DocType as DocTypeEnum

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_resume(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    try:
        body = await request.json()
        try:
            resume_in = ResumeCreate(**body)
        except ValidationError as ve:
            print("Pydantic Validation Error on Request:", ve)
            raise HTTPException(status_code=422, detail=ve.errors())
        
        # Résoudre le template : Il DOIT être actif
        doc_type_val_str = resume_in.doc_type if resume_in.doc_type else "cv"
        template = None
        if resume_in.template_id:
            template = db.query(Template).filter(
                (Template.id == resume_in.template_id) | (Template.slug == resume_in.template_id),
                Template.is_active == True,
                Template.template_type == doc_type_val_str
            ).first()

        # Si le template demandé n'est pas valide ou n'existe pas, prendre le premier gratuit actif
        if not template:
            template = db.query(Template).filter(
                Template.is_active == True,
                Template.price == 0,
                Template.template_type == doc_type_val_str
            ).first()
            if not template:
                # Fallback ultime (ne devrait jamais arriver si la base est bien initialisée)
                template = db.query(Template).filter(Template.is_active == True).first()
            
            if not template:
                raise HTTPException(status_code=400, detail="Aucun template actif disponible sur le système.")

        # Stocker l'UUID en BDD (respecte la FK), mais renvoyer le slug au frontend
        actual_template_uuid = template.id
        actual_template_slug = template.slug if template.slug else template.id

        try:
            doc_type_val = DocTypeEnum(resume_in.doc_type) if resume_in.doc_type else DocTypeEnum.CV
        except ValueError:
            doc_type_val = DocTypeEnum.CV

        new_resume = Resume(
            user_id=current_user.id,
            template_id=actual_template_uuid,   # UUID → respecte la FK
            title=resume_in.title,
            content=resume_in.content or {},
            status=ResumeStatus.DRAFT,
            doc_type=doc_type_val,
            linked_doc_id=resume_in.linked_doc_id
        )
        
        db.add(new_resume)
        db.commit()
        db.refresh(new_resume)
        
        # Renvoyer le slug au frontend pour que le renderer React le reconnaisse
        return {
            "id": new_resume.id,
            "user_id": new_resume.user_id,
            "title": new_resume.title,
            "template_id": actual_template_slug,
            "content": new_resume.content,
            "status": new_resume.status.value if hasattr(new_resume.status, 'value') else new_resume.status,
            "doc_type": new_resume.doc_type.value if hasattr(new_resume.doc_type, 'value') else new_resume.doc_type,
            "linked_doc_id": new_resume.linked_doc_id,
            "created_at": new_resume.created_at
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))




@router.put("/{resume_id}", response_model=ResumeOut)
async def update_resume(
    resume_id: str,
    resume_in: ResumeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Met à jour un CV"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="CV non trouvé")
    
    # Mettre à jour les champs fournis
    update_data = resume_in.model_dump(exclude_unset=True)
    if "template_id" in update_data and update_data["template_id"]:
        template = db.query(Template).filter(
            (Template.id == update_data["template_id"]) | (Template.slug == update_data["template_id"]),
            Template.is_active == True
        ).first()
        if not template:
            raise HTTPException(status_code=400, detail="Le template demandé n'est pas disponible ou est inactif.")
            
        update_data["template_id"] = template.id  # Store UUID in DB to respect Foreign Key

    for field, value in update_data.items():
        setattr(resume, field, value)
    
    try:
        db.commit()
        db.refresh(resume)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
    # Prepare response dict to return slug to frontend
    r_dict = {
        "id": resume.id,
        "title": resume.title,
        "template_id": resume.template_id,
        "status": resume.status.value if hasattr(resume.status, "value") else resume.status,
        "doc_type": resume.doc_type.value if hasattr(resume.doc_type, "value") else resume.doc_type,
        "linked_doc_id": resume.linked_doc_id,
        "content": resume.content,
        "user_id": resume.user_id,
        "created_at": resume.created_at,
        "updated_at": resume.updated_at
    }

    if resume.template_id:
        t = template if ("template_id" in update_data and update_data["template_id"]) else db.query(Template).filter(Template.id == resume.template_id).first()
        if t and t.slug:
            r_dict["template_id"] = t.slug
            
    return r_dict

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Supprime un CV"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="CV non trouvé")
    
    db.delete(resume)
    db.commit()
    
    return None

@router.patch("/{resume_id}/complete", response_model=ResumeOut)
async def mark_resume_complete(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Marque un CV comme complété"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="CV non trouvé")
    
    resume.status = ResumeStatus.COMPLETED
    db.commit()
    db.refresh(resume)
    
    return resume
