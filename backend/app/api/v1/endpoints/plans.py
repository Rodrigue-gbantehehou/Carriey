from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.subscription_plan import SubscriptionPlan
from app.schemas.subscription_plan import SubscriptionPlanOut, SubscriptionPlanUpdate, SubscriptionPlanCreate
from app.api.dependencies import get_current_admin

router = APIRouter()

@router.get("", response_model=List[SubscriptionPlanOut])
def get_plans(db: Session = Depends(get_db)):
    """Récupère tous les plans de tarification actifs (public)"""
    return db.query(SubscriptionPlan).filter(SubscriptionPlan.is_active == True).all()

@router.get("/admin", response_model=List[SubscriptionPlanOut])
def get_all_plans_admin(
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    """Récupère tous les plans (admin uniquement)"""
    return db.query(SubscriptionPlan).all()

@router.post("", response_model=SubscriptionPlanOut)
def create_plan(
    plan: SubscriptionPlanCreate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    """Crée un nouveau plan (admin uniquement)"""
    db_plan = SubscriptionPlan(**plan.model_dump())
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.put("/{plan_id}", response_model=SubscriptionPlanOut)
def update_plan(
    plan_id: str,
    plan_update: SubscriptionPlanUpdate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    """Met à jour un plan existant (admin uniquement)"""
    db_plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Plan non trouvé")
        
    update_data = plan_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_plan, key, value)
        
    db.commit()
    db.refresh(db_plan)
    return db_plan
