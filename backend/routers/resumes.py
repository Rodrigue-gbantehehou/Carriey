from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.resume import Resume, ResumeStatus
from models.template import Template
from models.payment import Payment, PaymentStatus
from schemas.resume import ResumeCreate, ResumeUpdate, ResumeOut, ResumeListOut
from auth.deps import get_current_active_user

router = APIRouter(prefix="/resumes", tags=["resumes"])

def verify_template_access(user_id: str, template_id: str, db: Session) -> bool:
    """Vérifie si l'utilisateur a accès au template (gratuit ou payé)"""
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        return False
    
    # Si gratuit, accès direct
    if template.price == 0:
        return True
    
    # Sinon, vérifier le paiement
    payment = db.query(Payment).filter(
        Payment.user_id == user_id,
        Payment.template_id == template_id,
        Payment.status == PaymentStatus.SUCCESS
    ).first()
    
    return payment is not None

@router.get("/", response_model=List[ResumeListOut])
async def list_resumes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Liste tous les CVs de l'utilisateur"""
    resumes = db.query(Resume).filter(
        Resume.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
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
    """Crée un nouveau CV"""
    # Vérifier l'accès au template
    if not verify_template_access(current_user.id, resume_in.template_id, db):
        raise HTTPException(
            status_code=403,
            detail="Vous devez acheter ce template pour créer un CV avec"
        )
    
    # Créer le resume
    new_resume = Resume(
        user_id=current_user.id,
        template_id=resume_in.template_id,
        title=resume_in.title,
        content=resume_in.content,
        status=ResumeStatus.DRAFT
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
