from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from database import get_db
from models.user import User
from models.profile import MasterProfile, Experience, Education, Skill, Project, Certification
from schemas.profile import (
    MasterProfile as MasterProfileOut, MasterProfileUpdate, MasterProfileCreate,
    Experience as ExperienceOut, ExperienceCreate,
    Education as EducationOut, EducationCreate,
    Skill as SkillOut, SkillCreate,
    Project as ProjectOut, ProjectCreate,
    Certification as CertificationOut, CertificationCreate
)
from auth.deps import get_current_active_user

router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("/me", response_model=MasterProfileOut)
async def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get the current user's master profile."""
    profile = db.query(MasterProfile).filter(MasterProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil non trouvé")
    return profile

@router.post("/me", response_model=MasterProfileOut, status_code=status.HTTP_201_CREATED)
async def create_my_profile(
    profile_in: MasterProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a master profile for the current user if it doesn't exist."""
    existing_profile = db.query(MasterProfile).filter(MasterProfile.user_id == current_user.id).first()
    if existing_profile:
        raise HTTPException(status_code=400, detail="Le profil existe déjà")
    
    new_profile = MasterProfile(
        user_id=current_user.id,
        **profile_in.model_dump(exclude_unset=True)
    )
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
    profile = db.query(MasterProfile).filter(MasterProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil non trouvé")
    
    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
        
    db.commit()
    db.refresh(profile)
    return profile

# --- Experiences ---

@router.post("/me/experiences", response_model=ExperienceOut, status_code=status.HTTP_201_CREATED)
async def add_experience(
    exp_in: ExperienceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    profile = db.query(MasterProfile).filter(MasterProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil non trouvé")
        
    new_exp = Experience(
        profile_id=profile.id,
        **exp_in.model_dump()
    )
    db.add(new_exp)
    db.commit()
    db.refresh(new_exp)
    return new_exp

@router.delete("/me/experiences/{exp_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_experience(
    exp_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    profile = db.query(MasterProfile).filter(MasterProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil non trouvé")
        
    exp = db.query(Experience).filter(Experience.id == exp_id, Experience.profile_id == profile.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expérience non trouvée")
        
    db.delete(exp)
    db.commit()
    return None

# Add similar CRUD routes for Education, Skill, Project, Certification...
