import os
import sys
import asyncio
from pathlib import Path
from dotenv import load_dotenv

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

# Create tables (simple auto-migration at startup for now)
Base.metadata.create_all(bind=engine)

# Add columns manually if they don't exist
try:
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE master_profiles ADD COLUMN first_name VARCHAR(100) DEFAULT NULL"))
            conn.commit()
        except Exception:
            pass # Column already exists
        try:
            conn.execute(text("ALTER TABLE master_profiles ADD COLUMN last_name VARCHAR(100) DEFAULT NULL"))
            conn.commit()
        except Exception:
            pass # Column already exists
        try:
            conn.execute(text("ALTER TABLE master_profiles ADD COLUMN photo_url TEXT DEFAULT NULL"))
            conn.commit()
        except Exception:
            pass # Column already exists
except Exception as e:
    print(f"Migration error: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description=f"API Backend for {settings.PROJECT_NAME} Flutter & Web",
    docs_url="/docs",
    redoc_url="/redoc"
)

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
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API Backend. Visit /docs for Swagger documentation."}
