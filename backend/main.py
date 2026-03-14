from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uvicorn
import os
from dotenv import load_dotenv

import models
import schemas
from database import engine, get_db
from routes import auth
from dependencies import get_current_active_user
from config import settings

# Charge les variables d'environnement
load_dotenv()

# Crée les tables de la base de données
models.Base.metadata.create_all(bind=engine)

# Initialise l'application FastAPI
app = FastAPI(
    title="CVtor API",
    description="API pour la génération et la gestion de CV",
    version="0.1.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes d'authentification
app.include_router(
    auth.router,
    prefix=settings.API_V1_STR,
    tags=["auth"]
)

# Inclure les routes des templates
from routes import templates
app.include_router(
    templates.router,
    prefix=settings.API_V1_STR
)

# Inclure les routes admin
from routes import admin_templates, admin_templates_upload, admin_users, admin_audit
app.include_router(
    admin_templates.router,
    prefix=settings.API_V1_STR
)
app.include_router(
    admin_templates_upload.router,
    prefix=settings.API_V1_STR
)
app.include_router(
    admin_users.router,
    prefix=settings.API_V1_STR
)
app.include_router(
    admin_audit.router,
    prefix=settings.API_V1_STR
)

# Route de test
@app.get("/")
def read_root():
    return {"message": "Bienvenue sur l'API CVtor"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
