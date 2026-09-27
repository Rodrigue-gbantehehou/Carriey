from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, profile, resumes, templates, exports, payments, personas, 
    admin_users, admin_templates, stats, admin_audit, admin_payments, 
    admin_resumes, admin_reports, public_pages, ai, plans
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(resumes.router, prefix="/resumes", tags=["resumes"])
api_router.include_router(exports.router, prefix="/exports", tags=["exports"])
api_router.include_router(personas.router, prefix="/personas", tags=["personas"])
api_router.include_router(public_pages.router, prefix="/pages", tags=["public-pages"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(plans.router, prefix="/plans", tags=["plans"])

# Admin routes
api_router.include_router(admin_templates.router, prefix="/admin/templates", tags=["admin"])
api_router.include_router(stats.router, prefix="/admin/stats", tags=["admin-stats"])
api_router.include_router(admin_audit.router, prefix="/admin/audit", tags=["admin"])
api_router.include_router(admin_users.router, prefix="/admin/users", tags=["admin"])
api_router.include_router(admin_payments.router, prefix="/admin/payments", tags=["admin"])
api_router.include_router(admin_resumes.router, prefix="/admin/resumes", tags=["admin"])
api_router.include_router(admin_reports.router, prefix="/admin/reports", tags=["admin"])

