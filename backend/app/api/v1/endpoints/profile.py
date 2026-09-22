from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from pathlib import Path
import uuid
import os

from app.db.session import get_db
from app.models.user import User
from app.models.profile import MasterProfile, Experience, Education, Skill, Project, Certification, Language, Achievement, Link, Document
from app.schemas.profile import (
    MasterProfile as MasterProfileOut, MasterProfileUpdate, MasterProfileCreate,
    Experience as ExperienceOut, ExperienceCreate,
    Education as EducationOut, EducationCreate,
    Skill as SkillOut, SkillCreate,
    Project as ProjectOut, ProjectCreate,
    Certification as CertificationOut, CertificationCreate,
    Language as LanguageOut, LanguageCreate,
    Achievement as AchievementOut, AchievementCreate,
    Link as LinkOut, LinkCreate,
    Document as DocumentOut, DocumentCreate
)
from app.crud.crud_profile import profile as crud_profile
from app.api.dependencies import get_current_active_user

router = APIRouter()

@router.get("/me", response_model=MasterProfileOut)
async def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get the current user's master profile. Creates it if it doesn't exist."""
    profile_db = crud_profile.get_by_user(db, user_id=current_user.id)
    if not profile_db:
        # Create an empty profile automatically
        new_profile = MasterProfile(user_id=current_user.id)
        db.add(new_profile)
        db.commit()
        db.refresh(new_profile)
        return new_profile
    return profile_db

@router.post("/me", response_model=MasterProfileOut, status_code=status.HTTP_201_CREATED)
async def create_my_profile(
    profile_in: MasterProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a master profile for the current user if it doesn't exist."""
    existing_profile = crud_profile.get_by_user(db, user_id=current_user.id)
    if existing_profile:
        raise HTTPException(status_code=400, detail="Le profil existe déjà")
    
    # We must explicitly add user_id because it's not in MasterProfileCreate
    profile_in_data = profile_in.model_dump(exclude_unset=True)
    profile_in_data["user_id"] = current_user.id
    
    new_profile = MasterProfile(**profile_in_data)
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile

@router.put("/me", response_model=MasterProfileOut)
async def update_my_profile(
    profile_in: MasterProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update the current user's master profile."""
    profile_db = crud_profile.get_by_user(db, user_id=current_user.id)
    if not profile_db:
        raise HTTPException(status_code=404, detail="Profil non trouvé")
    
    updated_profile = crud_profile.update(db, db_obj=profile_db, obj_in=profile_in)
    return updated_profile

@router.post("/me/photo", response_model=MasterProfileOut)
async def upload_profile_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Upload a profile photo. Saves to /static/photos/ and stores the URL."""
    profile_db = crud_profile.get_by_user(db, user_id=current_user.id)
    if not profile_db:
        raise HTTPException(status_code=404, detail="Profil non trouvé")
    
    ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in ALLOWED:
        raise HTTPException(status_code=400, detail="Format non supporté. Utilisez JPEG, PNG ou WebP.")
    
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:  # 5MB max
        raise HTTPException(status_code=400, detail="La photo ne doit pas dépasser 5 Mo.")
    
    # Save file to /static/photos/
    ext = file.filename.rsplit('.', 1)[-1].lower() if file.filename and '.' in file.filename else 'jpg'
    # profile.py is at: backend/app/api/v1/endpoints/profile.py → parents[4] = backend/
    BASE_DIR = Path(__file__).resolve().parents[4]
    photos_dir = BASE_DIR / "static" / "photos"
    photos_dir.mkdir(parents=True, exist_ok=True)
    
    # Delete old photo if it exists and is a local file
    if profile_db.photo_url and '/static/photos/' in str(profile_db.photo_url):
        old_filename = profile_db.photo_url.split('/static/photos/')[-1]
        old_path = photos_dir / old_filename
        if old_path.exists():
            old_path.unlink()
    
    filename = f"{current_user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    file_path = photos_dir / filename
    with open(file_path, 'wb') as f:
        f.write(contents)
    
    # Store as a server-relative URL
    photo_url = f"/static/photos/{filename}"
    profile_db.photo_url = photo_url
    db.commit()
    db.refresh(profile_db)
    return profile_db

# --- Helper for sub-entities ---

def register_sub_entity_routes(
    router: APIRouter, 
    path: str, 
    model_class, 
    create_schema, 
    out_schema, 
    entity_name: str
):
    @router.post(f"/me/{path}", response_model=out_schema, status_code=status.HTTP_201_CREATED)
    async def add_entity(
        entity_in: create_schema,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user)
    ):
        profile = db.query(MasterProfile).filter(MasterProfile.user_id == current_user.id).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Profil non trouvé")
            
        new_entity = model_class(
            profile_id=profile.id,
            **entity_in.model_dump()
        )
        db.add(new_entity)
        db.commit()
        db.refresh(new_entity)
        return new_entity

    @router.delete(f"/me/{path}/{{entity_id}}", status_code=status.HTTP_204_NO_CONTENT)
    async def delete_entity(
        entity_id: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user)
    ):
        profile = db.query(MasterProfile).filter(MasterProfile.user_id == current_user.id).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Profil non trouvé")
            
        entity = db.query(model_class).filter(model_class.id == entity_id, model_class.profile_id == profile.id).first()
        if not entity:
            raise HTTPException(status_code=404, detail=f"{entity_name} non trouvé(e)")
            
        db.delete(entity)
        db.commit()
        return None

    @router.put(f"/me/{path}/{{entity_id}}", response_model=out_schema)
    async def update_entity(
        entity_id: str,
        entity_in: create_schema,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user)
    ):
        profile = db.query(MasterProfile).filter(MasterProfile.user_id == current_user.id).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Profil non trouvé")
            
        entity = db.query(model_class).filter(model_class.id == entity_id, model_class.profile_id == profile.id).first()
        if not entity:
            raise HTTPException(status_code=404, detail=f"{entity_name} non trouvé(e)")
            
        update_data = entity_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(entity, field, value)
            
        db.commit()
        db.refresh(entity)
        return entity

# Register all sub-entities
register_sub_entity_routes(router, "experiences", Experience, ExperienceCreate, ExperienceOut, "Expérience")
register_sub_entity_routes(router, "educations", Education, EducationCreate, EducationOut, "Formation")
register_sub_entity_routes(router, "skills", Skill, SkillCreate, SkillOut, "Compétence")
register_sub_entity_routes(router, "projects", Project, ProjectCreate, ProjectOut, "Projet")
register_sub_entity_routes(router, "certifications", Certification, CertificationCreate, CertificationOut, "Certification")
register_sub_entity_routes(router, "languages", Language, LanguageCreate, LanguageOut, "Langue")
register_sub_entity_routes(router, "achievements", Achievement, AchievementCreate, AchievementOut, "Réalisation")
register_sub_entity_routes(router, "links", Link, LinkCreate, LinkOut, "Lien")
register_sub_entity_routes(router, "documents", Document, DocumentCreate, DocumentOut, "Document")
