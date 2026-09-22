from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.public_page import PublicPage
from app.schemas.public_page import PublicPageCreate, PublicPageUpdate
import uuid
import re


def get(db: Session, page_id: str) -> Optional[PublicPage]:
    return db.query(PublicPage).filter(PublicPage.id == page_id).first()


def get_by_slug(db: Session, slug: str) -> Optional[PublicPage]:
    return db.query(PublicPage).filter(PublicPage.slug == slug).first()


def get_by_user(db: Session, user_id: str) -> List[PublicPage]:
    return db.query(PublicPage).filter(PublicPage.user_id == user_id).order_by(PublicPage.created_at.desc()).all()


def slug_available(db: Session, slug: str, exclude_id: Optional[str] = None) -> bool:
    q = db.query(PublicPage).filter(PublicPage.slug == slug)
    if exclude_id:
        q = q.filter(PublicPage.id != exclude_id)
    return q.first() is None


def suggest_slug(db: Session, base: str, user_suffix: str = "") -> str:
    """Return an available slug based on the base, appending suffixes as needed."""
    base = re.sub(r'[^a-z0-9\-]', '-', base.lower())
    base = re.sub(r'-+', '-', base).strip('-')
    if len(base) < 3:
        base = base + "-cv"

    candidates = [base]
    if user_suffix:
        candidates.append(f"{base}-{user_suffix}")
    for i in range(2, 100):
        candidates.append(f"{base}-{i}")

    for slug in candidates:
        if slug_available(db, slug):
            return slug
    return f"{base}-{uuid.uuid4().hex[:6]}"


def create(db: Session, *, user_id: str, obj_in: PublicPageCreate) -> PublicPage:
    default_sections = {
        "bio": True, "experiences": True, "education": True,
        "skills": True, "projects": True, "certifications": True,
        "languages": True, "links": True,
    }
    db_obj = PublicPage(
        id=str(uuid.uuid4()),
        user_id=user_id,
        slug=obj_in.slug,
        title=obj_in.title,
        sections=obj_in.sections or default_sections,
        pinned_items=obj_in.pinned_items,
        expires_at=obj_in.expires_at,
        is_active=obj_in.is_active,
        theme=obj_in.theme,
        accent_color=obj_in.accent_color,
        show_photo=obj_in.show_photo,
        show_contact=obj_in.show_contact,
        views=0,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update(db: Session, *, db_obj: PublicPage, obj_in: PublicPageUpdate) -> PublicPage:
    data = obj_in.dict(exclude_unset=True)
    for field, value in data.items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete(db: Session, *, page_id: str, user_id: str) -> bool:
    page = db.query(PublicPage).filter(
        PublicPage.id == page_id, PublicPage.user_id == user_id
    ).first()
    if not page:
        return False
    db.delete(page)
    db.commit()
    return True


def increment_views(db: Session, page: PublicPage) -> None:
    page.views = (page.views or 0) + 1
    db.commit()
