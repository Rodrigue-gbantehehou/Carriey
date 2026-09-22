"""
Routes admin pour les rapports et exports CSV.
"""
import csv
import io
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
from decimal import Decimal

from app.db.session import get_db
from app.models.user import User
from app.models.payment import Payment, PaymentStatus
from app.models.resume import Resume, DocType
from app.models.template import Template
from app.api.dependencies import get_current_admin

router = APIRouter()


# ─── Export CSV Utilisateurs ──────────────────────────────────────────────────
@router.get("/users.csv")
async def export_users_csv(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Exporte la liste des utilisateurs en CSV"""
    users = db.query(User).order_by(User.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Email", "Nom complet", "Rôle", "Actif",
        "Nb CVs", "Nb Lettres", "Total payé (XOF)", "Date inscription"
    ])

    for u in users:
        cv_count = db.query(func.count(Resume.id)).filter(
            Resume.user_id == u.id, Resume.doc_type == DocType.CV
        ).scalar() or 0
        letter_count = db.query(func.count(Resume.id)).filter(
            Resume.user_id == u.id, Resume.doc_type == DocType.COVER_LETTER
        ).scalar() or 0
        total_paid = db.query(func.sum(Payment.amount)).filter(
            Payment.user_id == u.id, Payment.status == PaymentStatus.SUCCESS
        ).scalar() or Decimal("0")

        writer.writerow([
            u.id, u.email, u.full_name or "", u.role,
            "Oui" if u.is_active else "Non",
            cv_count, letter_count, int(total_paid),
            u.created_at.strftime("%d/%m/%Y") if u.created_at else ""
        ])

    output.seek(0)
    filename = f"cvtor_utilisateurs_{datetime.now().strftime('%Y%m%d')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


# ─── Export CSV Paiements ─────────────────────────────────────────────────────
@router.get("/payments.csv")
async def export_payments_csv(
    status: Optional[str] = Query(None),
    days: int = Query(90, description="Nombre de jours (défaut: 90)"),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Exporte les paiements en CSV"""
    start_date = datetime.now() - timedelta(days=days)
    query = db.query(Payment).filter(Payment.created_at >= start_date)
    if status:
        query = query.filter(Payment.status == status)
    payments = query.order_by(Payment.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Email Utilisateur", "Template", "Montant", "Devise",
        "Statut", "Provider", "ID Transaction Provider", "Date"
    ])

    for p in payments:
        user = db.query(User).filter(User.id == p.user_id).first()
        template = db.query(Template).filter(Template.id == p.template_id).first() if p.template_id else None
        writer.writerow([
            p.id,
            user.email if user else "Inconnu",
            template.name if template else "Inconnu",
            int(p.amount) if p.amount else 0,
            p.currency or "XOF",
            p.status,
            p.provider,
            p.provider_payment_id or "",
            p.created_at.strftime("%d/%m/%Y %H:%M") if p.created_at else ""
        ])

    output.seek(0)
    filename = f"cvtor_paiements_{datetime.now().strftime('%Y%m%d')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


# ─── Rapport mensuel ──────────────────────────────────────────────────────────
@router.get("/monthly")
async def get_monthly_report(
    months: int = Query(6, description="Nombre de mois d'historique"),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Rapport mensuel : inscriptions, CVs créés, revenus"""
    results = []
    now = datetime.now()

    for i in range(months - 1, -1, -1):
        # Calculer le début et la fin du mois
        month_date = now.replace(day=1) - timedelta(days=i * 30)
        start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if start.month == 12:
            end = start.replace(year=start.year + 1, month=1, day=1)
        else:
            end = start.replace(month=start.month + 1, day=1)

        new_users = db.query(func.count(User.id)).filter(
            User.created_at >= start, User.created_at < end
        ).scalar() or 0

        new_cv = db.query(func.count(Resume.id)).filter(
            Resume.created_at >= start, Resume.created_at < end,
            Resume.doc_type == DocType.CV
        ).scalar() or 0

        new_letters = db.query(func.count(Resume.id)).filter(
            Resume.created_at >= start, Resume.created_at < end,
            Resume.doc_type == DocType.COVER_LETTER
        ).scalar() or 0

        revenue = db.query(func.sum(Payment.amount)).filter(
            Payment.status == PaymentStatus.SUCCESS,
            Payment.created_at >= start, Payment.created_at < end
        ).scalar() or Decimal("0")

        payment_count = db.query(func.count(Payment.id)).filter(
            Payment.status == PaymentStatus.SUCCESS,
            Payment.created_at >= start, Payment.created_at < end
        ).scalar() or 0

        results.append({
            "period": start.strftime("%B %Y"),
            "period_key": start.strftime("%Y-%m"),
            "new_users": new_users,
            "new_cv": new_cv,
            "new_letters": new_letters,
            "new_docs": new_cv + new_letters,
            "revenue": int(revenue),
            "payment_count": payment_count,
        })

    return results


# ─── Revenus par période (pour graphique) ────────────────────────────────────
@router.get("/revenue-chart")
async def get_revenue_chart(
    days: int = Query(30, description="Nombre de jours"),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Données pour le graphique des revenus journaliers"""
    start_date = datetime.now() - timedelta(days=days)

    results = db.query(
        func.date(Payment.created_at).label("date"),
        func.sum(Payment.amount).label("revenue"),
        func.count(Payment.id).label("count")
    ).filter(
        Payment.status == PaymentStatus.SUCCESS,
        Payment.created_at >= start_date
    ).group_by(
        func.date(Payment.created_at)
    ).order_by(
        func.date(Payment.created_at)
    ).all()

    return [
        {
            "date": str(r.date),
            "revenue": int(r.revenue or 0),
            "count": r.count or 0
        }
        for r in results
    ]
