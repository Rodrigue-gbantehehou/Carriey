import os
import sys
import asyncio
import time
import logging
from pathlib import Path
from dotenv import load_dotenv

# ─── Logging centralisé (doit être fait en PREMIER) ──────────────────────────
from app.core.logging_config import setup_logging, get_logger
setup_logging()
logger = get_logger("carriey")

# Load env before imports
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(env_path)

# Windows asyncio fix for Playwright
if sys.platform == 'win32':
    try:
        _set_policy = getattr(asyncio, "set_event_loop_policy", None)
        _policy_cls = getattr(asyncio, "WindowsProactorEventLoopPolicy", None)
        if _set_policy and _policy_cls:
            _set_policy(_policy_cls())
    except Exception:
        pass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.api.v1.api import api_router
from sqlalchemy import text
from app.db.session import engine, Base
# Ensure all models are loaded for create_all
import app.models.user
import app.models.profile
import app.models.persona
import app.models.payment
import app.models.resume
import app.models.template
import app.models.audit
import app.models.public_page
import app.models.candidature
import app.models.subscription_plan

# Créer les tables manquantes au démarrage (idempotent)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"[WARNING] create_all failed: {e}")

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from app.core.limiter import limiter

from contextlib import asynccontextmanager
from app.services.cleanup_service import cleanup_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Démarrage des services d'arrière-plan...")
    cleanup_service.start(retention_hours=48, interval_seconds=3600)
    yield
    # Shutdown
    logger.info("Arrêt des services d'arrière-plan...")
    cleanup_service.stop()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description=f"API Backend for {settings.PROJECT_NAME} Flutter & Web",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ─── Middleware de log des requêtes HTTP (style access log) ──────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start) * 1000
    level = logging.WARNING if response.status_code >= 400 else logging.INFO
    logger.log(level,
        f'{request.method} {request.url.path} → {response.status_code} '
        f'({duration_ms:.0f}ms) [{request.client.host if request.client else "?"}]'
    )
    return response

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
STATIC_DIR.mkdir(exist_ok=True)
(STATIC_DIR / "previews").mkdir(parents=True, exist_ok=True)
(STATIC_DIR / "photos").mkdir(parents=True, exist_ok=True)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Include the API router
app.include_router(api_router, prefix=settings.API_STR)

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API Backend. Visit /docs for Swagger documentation."}
