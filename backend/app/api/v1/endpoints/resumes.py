from typing import List
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
    doc_type: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Liste tous les documents de l'utilisateur (filtrable par doc_type)"""
    query = db.query(Resume).filter(Resume.user_id == current_user.id)
    if doc_type:
        query = query.filter(Resume.doc_type == doc_type)
        
    resumes = query.order_by(Resume.created_at.desc()).offset(skip).limit(limit).all()
    
    return resumes

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
    
    return resume

@router.post("/", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
async def create_resume(
    resume_in: ResumeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Crée un nouveau CV (la sauvegarde de brouillon est libre pour tous les utilisateurs)"""
    # Résoudre le template par ID ou par slug
    template = db.query(Template).filter(
        (Template.id == resume_in.template_id) | (Template.slug == resume_in.template_id)
    ).first()
    actual_template_id = template.id if template else resume_in.template_id

    # Créer le resume
    new_resume = Resume(
        user_id=current_user.id,
        template_id=actual_template_id,
        title=resume_in.title,
        content=resume_in.content,
        status=ResumeStatus.DRAFT,
        doc_type=resume_in.doc_type,
        linked_doc_id=resume_in.linked_doc_id
    )
    
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)
    
    return new_resume

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
            (Template.id == update_data["template_id"]) | (Template.slug == update_data["template_id"])
        ).first()
        if template:
            update_data["template_id"] = template.id

    for field, value in update_data.items():
        setattr(resume, field, value)
    
    db.commit()
    db.refresh(resume)
    
    return resume

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
