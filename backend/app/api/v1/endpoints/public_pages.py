from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from app.db.session import get_db
from app.models.user import User
from app.models.profile import MasterProfile
from app.schemas.public_page import PublicPageCreate, PublicPageUpdate, PublicPageOut, SlugCheckOut
from app.crud import crud_public_page, crud_profile
from app.api.dependencies import get_current_active_user

router = APIRouter()


# ──────────────────────────────────────────────
# Auth-required routes
# ──────────────────────────────────────────────

@router.get("/", response_model=List[PublicPageOut])
async def list_my_pages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all public pages created by the current user."""
    return crud_public_page.get_by_user(db, user_id=current_user.id)


@router.post("/", response_model=PublicPageOut, status_code=201)
async def create_page(
    obj_in: PublicPageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new public page."""
    if not crud_public_page.slug_available(db, obj_in.slug):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Le slug '{obj_in.slug}' est déjà utilisé. Essayez : {crud_public_page.suggest_slug(db, obj_in.slug)}"
        )
    return crud_public_page.create(db, user_id=current_user.id, obj_in=obj_in)


@router.patch("/{page_id}", response_model=PublicPageOut)
async def update_page(
    page_id: str,
    obj_in: PublicPageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a public page. Only the owner can edit."""
    from app.models.public_page import PublicPage
    page = db.query(PublicPage).filter(PublicPage.id == page_id, PublicPage.user_id == current_user.id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page non trouvée")

    if obj_in.slug and obj_in.slug != page.slug:
        if not crud_public_page.slug_available(db, obj_in.slug, exclude_id=page_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Le slug '{obj_in.slug}' est déjà utilisé."
            )

    return crud_public_page.update(db, db_obj=page, obj_in=obj_in)


@router.delete("/{page_id}", status_code=204)
async def delete_page(
    page_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a public page."""
    deleted = crud_public_page.delete(db, page_id=page_id, user_id=current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Page non trouvée")


@router.get("/check-slug", response_model=SlugCheckOut)
async def check_slug(
    slug: str = Query(..., min_length=3, max_length=100),
    exclude_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Check if a slug is available. Returns a suggestion if not."""
    import re
    clean = re.sub(r'[^a-z0-9\-]', '-', slug.lower())
    available = crud_public_page.slug_available(db, clean, exclude_id=exclude_id)
    suggestion = None if available else crud_public_page.suggest_slug(db, clean)
    return SlugCheckOut(slug=clean, available=available, suggestion=suggestion)


# ──────────────────────────────────────────────
# Public routes (no auth)
# ──────────────────────────────────────────────

@router.get("/public/{slug}")
async def get_public_page(slug: str, db: Session = Depends(get_db)):
    """Fetch a public page by slug. Increments view count. Returns full filtered profile."""
    page = crud_public_page.get_by_slug(db, slug)
    if not page:
        raise HTTPException(status_code=404, detail="Cette page n'existe pas")

    if not page.is_active:
        raise HTTPException(status_code=403, detail="Cette page est désactivée")

    # Check expiry
    if page.expires_at:
        now = datetime.now(timezone.utc)
        exp = page.expires_at
        if exp.tzinfo is None:
            from datetime import timezone as tz
            exp = exp.replace(tzinfo=tz.utc)
        if now > exp:
            raise HTTPException(status_code=410, detail="Ce lien a expiré")

    # Increment views (fire-and-forget style)
    crud_public_page.increment_views(db, page)

    # Fetch owner's profile
    profile = crud_profile.profile.get_by_user(db, user_id=page.user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profil introuvable")

    sections = page.sections or {}
    pinned = page.pinned_items or {}

    def filter_list(items, section_key):
        if not sections.get(section_key, True):
            return []
        if section_key in pinned and pinned[section_key]:
            return [i for i in items if i.id in pinned[section_key]]
        return items

    from app.schemas.profile import MasterProfile as MasterProfileOut

    result = {
        "page": {
            "id": page.id,
            "slug": page.slug,
            "title": page.title,
            "theme": page.theme,
            "accent_color": page.accent_color,
            "show_photo": page.show_photo,
            "show_contact": page.show_contact,
            "sections": sections,
            "views": page.views,
        },
        "profile": {
            "first_name": profile.first_name,
            "last_name": profile.last_name,
            "username": profile.username,
            "title": profile.title,
            "bio": profile.bio if sections.get("bio", True) else None,
            "location": profile.location if page.show_contact else None,
            "contact_email": profile.contact_email if page.show_contact else None,
            "contact_phone": profile.contact_phone if page.show_contact else None,
            "website": profile.website,
            "linkedin_url": profile.linkedin_url,
            "github_url": profile.github_url,
            "photo_url": profile.photo_url if page.show_photo else None,
            "experiences": [
                {"id": e.id, "title": e.title, "company": e.company, "location": e.location,
                 "start_date": str(e.start_date) if e.start_date else None,
                 "end_date": str(e.end_date) if e.end_date else None,
                 "current": e.current, "description": e.description}
                for e in filter_list(profile.experiences, "experiences")
            ],
            "educations": [
                {"id": e.id, "degree": e.degree, "school": e.school, "location": e.location,
                 "start_date": str(e.start_date) if e.start_date else None,
                 "end_date": str(e.end_date) if e.end_date else None, "description": e.description}
                for e in filter_list(profile.educations, "education")
            ],
            "skills": [
                {"id": s.id, "name": s.name, "level": s.level}
                for s in filter_list(profile.skills, "skills")
            ],
            "projects": [
                {"id": p.id, "name": p.name, "description": p.description, "url": p.url,
                 "start_date": str(p.start_date) if p.start_date else None,
                 "end_date": str(p.end_date) if p.end_date else None}
                for p in filter_list(profile.projects, "projects")
            ],
            "certifications": [
                {"id": c.id, "name": c.name, "issuer": c.issuer,
                 "date": str(c.date) if c.date else None, "url": c.url}
                for c in filter_list(profile.certifications, "certifications")
            ],
            "languages": [
                {"id": l.id, "name": l.name, "level": l.level}
                for l in filter_list(profile.languages, "languages")
            ],
            "links": [
                {"id": l.id, "label": l.label, "url": l.url}
                for l in filter_list(profile.links, "links")
            ],
        }
    }

    return result
