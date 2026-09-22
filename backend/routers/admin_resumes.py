"""
Routes admin pour la gestion des CVs et lettres de motivation de tous les utilisateurs.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel

from database import get_db
from models.user import User
from models.resume import Resume, ResumeStatus, DocType
from models.template import Template
from auth.deps import get_current_admin

router = APIRouter(prefix="/admin/resumes", tags=["admin-resumes"])


# ─── Schemas ──────────────────────────────────────────────────────────────────
class AdminResumeOut(BaseModel):
    id: str
    title: str
    status: str
    doc_type: str
    user_id: str
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    template_id: Optional[str] = None
    template_name: Optional[str] = None
    linked_doc_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AdminResumeDetail(AdminResumeOut):
    content: Optional[dict] = None


class AdminDocStats(BaseModel):
    total_cv: int
    total_cover_letters: int
    created_this_month: int
    cv_this_month: int
    letters_this_month: int
    by_template: List[dict]
    by_status: dict


# ─── Helpers ──────────────────────────────────────────────────────────────────
def _enrich_resume(r: Resume, db: Session, with_content: bool = False) -> dict:
    user = db.query(User).filter(User.id == r.user_id).first()
    template = db.query(Template).filter(Template.id == r.template_id).first() if r.template_id else None
    result = {
        "id": r.id,
        "title": r.title,
        "status": r.status,
        "doc_type": r.doc_type if r.doc_type else "cv",
        "user_id": r.user_id,
        "user_email": user.email if user else None,
        "user_name": user.full_name if user else None,
        "template_id": r.template_id,
        "template_name": template.name if template else None,
        "linked_doc_id": r.linked_doc_id,
        "created_at": r.created_at,
        "updated_at": r.updated_at,
    }
    if with_content:
        result["content"] = r.content
    return result


# ─── Endpoints ────────────────────────────────────────────────────────────────
@router.get("/stats", response_model=AdminDocStats)
async def get_docs_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Statistiques globales sur les CVs et lettres de motivation"""
    now = datetime.now()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_cv = db.query(func.count(Resume.id)).filter(Resume.doc_type == DocType.CV).scalar() or 0
    total_cl = db.query(func.count(Resume.id)).filter(Resume.doc_type == DocType.COVER_LETTER).scalar() or 0
    cv_month = db.query(func.count(Resume.id)).filter(
        Resume.doc_type == DocType.CV,
        Resume.created_at >= start_of_month
    ).scalar() or 0
    cl_month = db.query(func.count(Resume.id)).filter(
        Resume.doc_type == DocType.COVER_LETTER,
        Resume.created_at >= start_of_month
    ).scalar() or 0

    # Par template
    by_template_raw = db.query(
        Template.name,
        func.count(Resume.id).label("count")
    ).join(Resume, Resume.template_id == Template.id, isouter=True).group_by(Template.id, Template.name).order_by(func.count(Resume.id).desc()).limit(10).all()

    by_template = [{"template": row.name, "count": row.count} for row in by_template_raw]

    # Par statut
    draft_count = db.query(func.count(Resume.id)).filter(Resume.status == ResumeStatus.DRAFT).scalar() or 0
    done_count = db.query(func.count(Resume.id)).filter(Resume.status == ResumeStatus.COMPLETED).scalar() or 0

    return AdminDocStats(
        total_cv=total_cv,
        total_cover_letters=total_cl,
        created_this_month=cv_month + cl_month,
        cv_this_month=cv_month,
        letters_this_month=cl_month,
        by_template=by_template,
        by_status={"draft": draft_count, "completed": done_count}
    )


@router.get("/", response_model=List[dict])
async def list_all_documents(
    skip: int = 0,
    limit: int = 50,
    doc_type: Optional[str] = Query(None, description="cv | cover_letter"),
    status: Optional[str] = Query(None, description="draft | completed"),
    user_id: Optional[str] = Query(None),
    template_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None, description="Recherche par titre ou email"),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Liste tous les CVs et lettres de motivation avec filtres"""
    query = db.query(Resume)

    if doc_type:
        query = query.filter(Resume.doc_type == doc_type)
    if status:
        query = query.filter(Resume.status == status)
    if user_id:
        query = query.filter(Resume.user_id == user_id)
    if template_id:
        query = query.filter(Resume.template_id == template_id)
    if search:
        # Recherche par titre ou par email user (join)
        user_ids = [u.id for u in db.query(User).filter(User.email.ilike(f"%{search}%")).all()]
        query = query.filter(
            (Resume.title.ilike(f"%{search}%")) | (Resume.user_id.in_(user_ids))
        )

    total = query.count()
    resumes = query.order_by(Resume.created_at.desc()).offset(skip).limit(limit).all()

    return [_enrich_resume(r, db) for r in resumes]


@router.get("/{doc_id}", response_model=dict)
async def get_document_detail(
    doc_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Détail complet d'un document (CV ou lettre de motivation), inclut le contenu JSON"""
    resume = db.query(Resume).filter(Resume.id == doc_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Document non trouvé")

    result = _enrich_resume(resume, db, with_content=True)

    # Si lié à un autre doc, l'inclure aussi
    if resume.linked_doc_id:
        linked = db.query(Resume).filter(Resume.id == resume.linked_doc_id).first()
        if linked:
            result["linked_doc"] = {
                "id": linked.id,
                "title": linked.title,
                "doc_type": linked.doc_type,
                "status": linked.status,
            }

    return result


@router.delete("/{doc_id}", status_code=204)
async def delete_document(
    doc_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Supprime un document (CV ou lettre de motivation)"""
    resume = db.query(Resume).filter(Resume.id == doc_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Document non trouvé")

    db.delete(resume)
    db.commit()
    return None
