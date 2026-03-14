"""
Routes admin pour les statistiques
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Optional

from database import get_db
from models.user import User
from models.payment import Payment, PaymentStatus
from models.template import Template
from models.resume import Resume
from middleware.admin_deps import get_current_admin_user
from pydantic import BaseModel
from decimal import Decimal

router = APIRouter()

class OverviewStats(BaseModel):
    total_users: int
    active_users: int
    total_templates: int
    active_templates: int
    total_resumes: int
    total_payments: int
    successful_payments: int
    total_revenue: Decimal
    revenue_currency: str = "XOF"

class RevenueByPeriod(BaseModel):
    period: str
    revenue: Decimal
    payment_count: int

class TemplateStats(BaseModel):
    template_id: str
    template_name: str
    purchase_count: int
    revenue: Decimal

@router.get("/overview", response_model=OverviewStats)
async def get_overview_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Récupère les statistiques générales de la plateforme"""
    
    # Statistiques utilisateurs
    total_users = db.query(func.count(User.id)).scalar()
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
    
    # Statistiques templates
    total_templates = db.query(func.count(Template.id)).scalar()
    active_templates = db.query(func.count(Template.id)).filter(Template.is_active == True).scalar()
    
    # Statistiques CV
    total_resumes = db.query(func.count(Resume.id)).scalar()
    
    # Statistiques paiements
    total_payments = db.query(func.count(Payment.id)).scalar()
    successful_payments = db.query(func.count(Payment.id)).filter(
        Payment.status == PaymentStatus.SUCCESS
    ).scalar()
    
    # Revenus totaux
    total_revenue = db.query(func.sum(Payment.amount)).filter(
        Payment.status == PaymentStatus.SUCCESS
    ).scalar() or Decimal("0")
    
    return OverviewStats(
        total_users=total_users or 0,
        active_users=active_users or 0,
        total_templates=total_templates or 0,
        active_templates=active_templates or 0,
        total_resumes=total_resumes or 0,
        total_payments=total_payments or 0,
        successful_payments=successful_payments or 0,
        total_revenue=total_revenue
    )

@router.get("/revenue", response_model=list[RevenueByPeriod])
async def get_revenue_by_period(
    days: int = Query(30, description="Nombre de jours à analyser"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Récupère les revenus par période"""
    
    start_date = datetime.now() - timedelta(days=days)
    
    # Grouper par jour
    results = db.query(
        func.date(Payment.created_at).label("period"),
        func.sum(Payment.amount).label("revenue"),
        func.count(Payment.id).label("payment_count")
    ).filter(
        Payment.status == PaymentStatus.SUCCESS,
        Payment.created_at >= start_date
    ).group_by(
        func.date(Payment.created_at)
    ).all()
    
    return [
        RevenueByPeriod(
            period=str(result.period),
            revenue=result.revenue or Decimal("0"),
            payment_count=result.payment_count or 0
        )
        for result in results
    ]

@router.get("/templates", response_model=list[TemplateStats])
async def get_template_stats(
    limit: int = Query(10, description="Nombre de templates à retourner"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Récupère les statistiques des templates les plus vendus"""
    
    results = db.query(
        Template.id,
        Template.name,
        func.count(Payment.id).label("purchase_count"),
        func.sum(Payment.amount).label("revenue")
    ).join(
        Payment, Payment.template_id == Template.id
    ).filter(
        Payment.status == PaymentStatus.SUCCESS
    ).group_by(
        Template.id, Template.name
    ).order_by(
        func.count(Payment.id).desc()
    ).limit(limit).all()
    
    return [
        TemplateStats(
            template_id=result.id,
            template_name=result.name,
            purchase_count=result.purchase_count or 0,
            revenue=result.revenue or Decimal("0")
        )
        for result in results
    ]
