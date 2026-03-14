from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import cv as models
from models.user import User
from schemas import cv as schemas
from auth.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[schemas.CVOut])
def read_cvs(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all CVs for the current user."""
    cvs = db.query(models.CV).filter(models.CV.user_id == current_user.id).offset(skip).limit(limit).all()
    return cvs

@router.get("/{cv_id}", response_model=schemas.CVOut)
def read_cv(
    cv_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve a specific CV by ID."""
    cv = db.query(models.CV).filter(models.CV.id == cv_id, models.CV.user_id == current_user.id).first()
    if cv is None:
        raise HTTPException(status_code=404, detail="CV not found")
    return cv

@router.post("/", response_model=schemas.CVOut)
def create_cv(
    cv_in: schemas.CVCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new CV."""
    # 1. Create the main CV object
    db_cv = models.CV(
        user_id=current_user.id,
        title=cv_in.title,
        full_name=cv_in.full_name,
        email=cv_in.email,
        phone=cv_in.phone,
        address=cv_in.address,
        linkedin_url=cv_in.linkedin_url,
        website_url=cv_in.website_url,
        summary=cv_in.summary
    )
    db.add(db_cv)
    db.commit()
    db.refresh(db_cv)

    # 2. Add Experiences
    for exp_in in cv_in.experiences:
        db_exp = models.Experience(
            cv_id=db_cv.id,
            **exp_in.model_dump() # Pydantic v2
        )
        db.add(db_exp)

    # 3. Add Educations
    for edu_in in cv_in.educations:
        db_edu = models.Education(
            cv_id=db_cv.id,
            **edu_in.model_dump()
        )
        db.add(db_edu)

    # 4. Add Skills
    for skill_in in cv_in.skills:
        db_skill = models.SkillGroup(
            cv_id=db_cv.id,
            **skill_in.model_dump()
        )
        db.add(db_skill)

    db.commit()
    db.refresh(db_cv)
    return db_cv

@router.delete("/{cv_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cv(
    cv_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a CV."""
    cv = db.query(models.CV).filter(models.CV.id == cv_id, models.CV.user_id == current_user.id).first()
    if cv is None:
        raise HTTPException(status_code=404, detail="CV not found")
    
    db.delete(cv)
    db.commit()
    return None

@router.put("/{cv_id}", response_model=schemas.CVOut)
def update_cv(
    cv_id: int, 
    cv_in: schemas.CVUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a CV (Full update for relations is easiest for now)."""
    cv = db.query(models.CV).filter(models.CV.id == cv_id, models.CV.user_id == current_user.id).first()
    if cv is None:
        raise HTTPException(status_code=404, detail="CV not found")

    # Update basic fields
    update_data = cv_in.model_dump(exclude_unset=True)
    
    # Handle relations specifically if provided
    # Strategy: clear and re-add if list provided (simple implementation)
    
    if "experiences" in update_data:
        # Remove old
        db.query(models.Experience).filter(models.Experience.cv_id == cv_id).delete()
        # Add new
        for exp in cv_in.experiences:
            db_exp = models.Experience(cv_id=cv_id, **exp.model_dump())
            db.add(db_exp)
        del update_data["experiences"] # Handled

    if "educations" in update_data:
        db.query(models.Education).filter(models.Education.cv_id == cv_id).delete()
        for edu in cv_in.educations:
            db_edu = models.Education(cv_id=cv_id, **edu.model_dump())
            db.add(db_edu)
        del update_data["educations"]

    if "skills" in update_data:
        db.query(models.SkillGroup).filter(models.SkillGroup.cv_id == cv_id).delete()
        for skill in cv_in.skills:
            db_skill = models.SkillGroup(cv_id=cv_id, **skill.model_dump())
            db.add(db_skill)
        del update_data["skills"]

    # Update remaining fields on CV
    for field, value in update_data.items():
        setattr(cv, field, value)

    db.commit()
    db.refresh(cv)
    return cv
