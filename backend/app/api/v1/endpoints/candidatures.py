from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.dependencies import get_current_active_user
from app.crud.crud_candidature import candidature as crud_candidature
from app.schemas.candidature import CandidatureCreate, CandidatureUpdate, CandidatureOut
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[CandidatureOut])
def read_candidatures(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieve all applications for the current user.
    """
    candidatures = crud_candidature.get_by_user(db=db, user_id=current_user.id)
    return candidatures

@router.post("/", response_model=CandidatureOut)
def create_candidature(
    *,
    db: Session = Depends(get_db),
    candidature_in: CandidatureCreate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Create new application.
    """
    candidature = crud_candidature.create_with_user(db=db, obj_in=candidature_in, user_id=current_user.id)
    return candidature

@router.put("/{id}", response_model=CandidatureOut)
def update_candidature(
    *,
    db: Session = Depends(get_db),
    id: str,
    candidature_in: CandidatureUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Update an application.
    """
    candidature = crud_candidature.get(db=db, id=id)
    if not candidature:
        raise HTTPException(status_code=404, detail="Candidature not found")
    if candidature.user_id != current_user.id and current_user.role != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    candidature = crud_candidature.update(db=db, db_obj=candidature, obj_in=candidature_in)
    return candidature

@router.delete("/{id}", response_model=CandidatureOut)
def delete_candidature(
    *,
    db: Session = Depends(get_db),
    id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete an application.
    """
    candidature = crud_candidature.get(db=db, id=id)
    if not candidature:
        raise HTTPException(status_code=404, detail="Candidature not found")
    if candidature.user_id != current_user.id and current_user.role != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db.delete(candidature)
    db.commit()
    return candidature
