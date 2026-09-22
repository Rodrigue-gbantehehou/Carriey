import os
import sys
import subprocess
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models.user import User
from models.template import Template, TemplateAsset
from schemas.template import TemplateCreate, TemplateUpdate, TemplateOut, TemplateListOut, TemplateFiles
from auth.deps import get_current_admin, get_current_super_admin
from services.rendering_service import render_html_from_strings, render_html_by_name, PLACEHOLDER_PHOTO_B64
from generate_pdf_from_html import take_screenshot
from routers.exports import _PRINT_CACHE

from config import settings

# Get the base templates directory from settings
TEMPLATES_DIR = Path(settings.TEMPLATES_DIR)
BASE_DIR = Path(settings.BASE_DIR)
STATIC_DIR = BASE_DIR / "static"

# Dummy data for live preview
PREVIEW_DUMMY_DATA = {
    "profile": {
        "name": "Jean Dupont",
        "title": "Développeur Full Stack Senior",
        "email": "jean.dupont@example.com",
        "phone": "+33 6 12 34 56 78",
        "location": "Paris, France",
        "linkedin": "linkedin.com/in/jeandupont",
        "github": "github.com/jeandupont",
        "photo": PLACEHOLDER_PHOTO_B64
    },
    "summary": "Développeur passionné avec 8 ans d'expérience dans la création d'applications web modernes. Expert en React, Python et architecture cloud.",
    "experience": [
        {
            "title": "Lead Developer",
            "company": "TechCorp",
            "period": "2021 - Présent",
            "location": "Paris",
            "description": "Direction d'une équipe de 5 développeurs. Mise en place d'une architecture microservices. Réduction de 40% des temps de chargement."
        },
        {
            "title": "Développeur Full Stack",
            "company": "StartupXYZ",
            "period": "2018 - 2021",
            "location": "Lyon",
            "description": "Développement d'une plateforme SaaS de gestion RH. Stack: React, Node.js, PostgreSQL."
        }
    ],
    "education": [
        {
            "degree": "Master Informatique",
            "school": "Université Paris-Saclay",
            "period": "2016 - 2018",
            "description": "Spécialisation en génie logiciel et systèmes distribués."
        }
    ],
    "skills": [
        {"name": "Python", "level": 95},
        {"name": "React / Next.js", "level": 90},
        {"name": "TypeScript", "level": 85},
        {"name": "Docker / Kubernetes", "level": 80},
        {"name": "PostgreSQL", "level": 85}
    ],
    "languages": [
        {"name": "Français", "level": "Natif"},
        {"name": "Anglais", "level": "Courant (C1)"},
        {"name": "Espagnol", "level": "Intermédiaire (B2)"}
    ],
    "projects": [
        {
            "name": "CVtor Platform",
            "description": "Plateforme de génération de CV en ligne",
            "tech": "Next.js, FastAPI, MySQL",
            "url": "github.com/jeandupont/cvtor"
        }
    ]
}

class LivePreviewRequest(BaseModel):
    template_json: str = ""
    style_css: str = ""
    template_jinja2: str = ""

router = APIRouter(prefix="/admin/templates", tags=["admin-templates"])

@router.post("/preview-live", response_class=HTMLResponse)
async def preview_template_live(
    req: LivePreviewRequest,
    current_user: User = Depends(get_current_admin)
):
    """Rendu en temps réel d'un template à partir de son contenu brut (sans sauvegarde)"""
    html = render_html_from_strings(
        jinja_str=req.template_jinja2,
        css_str=req.style_css,
        config_json=req.template_json,
        data=PREVIEW_DUMMY_DATA
    )
    return HTMLResponse(content=html)


@router.get("/", response_model=List[TemplateListOut])
async def list_templates(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Liste tous les templates (admin uniquement)"""
    templates = db.query(Template).offset(skip).limit(limit).all()
    return templates

@router.get("/{template_id}", response_model=TemplateOut)
async def get_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Récupère un template spécifique"""
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template non trouvé")
    return template

@router.post("/", response_model=TemplateOut, status_code=status.HTTP_201_CREATED)
async def create_template(
    template_in: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Crée un nouveau template avec des fichiers boilerplate"""
    # Vérifier que le slug n'existe pas déjà
    existing = db.query(Template).filter(Template.slug == template_in.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Un template avec ce slug existe déjà")
    
    # Créer le dossier pour le template
    template_folder = TEMPLATES_DIR / template_in.slug
    template_folder.mkdir(parents=True, exist_ok=True)
    
    # Fichiers par défaut (Boilerplate)
    boilerplate = {
        "template.json": {
            "templateName": template_in.name,
            "fonts": {"heading": "Montserrat", "body": "Open Sans"},
            "colors": {"primary": "#2D3748", "secondary": "#F7FAFC", "accent": "#805AD5"},
            "layout": {"twoColumn": True, "sidebarWidth": "35%"},
            "sections": [
                {"type": "contact", "label": "Contact"},
                {"type": "summary", "label": "Résumé"},
                {"type": "experience", "label": "Expériences"},
                {"type": "education", "label": "Formation"},
                {"type": "skills", "label": "Compétences"}
            ]
        },
        "style.css": "/* Style pour " + template_in.name + " */\n\nbody {\n  font-family: 'Open Sans', sans-serif;\n  color: #2D3748;\n  line-height: 1.5;\n}\n\nh1, h2, h3 {\n  font-family: 'Montserrat', sans-serif;\n  color: #1A202C;\n}\n",
        "template.jinja2": "<div class=\"cv-container\">\n  <header>\n    <h1>{{ data.profile.name }}</h1>\n    <p>{{ data.profile.title }}</p>\n  </header>\n  \n  <div class=\"main-content\">\n    <section class=\"summary\">\n      <h2>Résumé</h2>\n      <p>{{ data.summary }}</p>\n    </section>\n    \n    <section class=\"experience\">\n      <h2>Expériences</h2>\n      {% for exp in data.experience %}\n        <div class=\"exp-item\">\n          <h3>{{ exp.title }} @ {{ exp.company }}</h3>\n          <p>{{ exp.period }}</p>\n          <p>{{ exp.description }}</p>\n        </div>\n      {% endfor %}\n    </section>\n  </div>\n</div>\n",
        "Template.tsx": """import React from 'react';
import { TemplateProps } from '@/types/cv';
import { TemplateStyles, RemoteStyles } from '../BaseComponents';

const Template: React.FC<TemplateProps> = ({ data, config, apiBaseUrl }) => {
  const { profile, summary, experience, education, skills, languages, projects, custom_sections } = data;
  
  return (
    <div className="cv-rendering-root cv-container">
      <RemoteStyles templateName={config.templateName} apiBaseUrl={apiBaseUrl} />
      <TemplateStyles config={config} />
      
      <header className="header" style={{ padding: '40px', textAlign: 'center' }}>
        <h1 className="name" style={{ fontSize: '2.5em', margin: 0 }}>{profile.name || 'Nom Prénom'}</h1>
        <p className="profession" style={{ fontSize: '1.2em', color: 'var(--color-accent)' }}>{profile.position || profile.title}</p>
      </header>
      
      <div className="main-content" style={{ padding: '0 40px' }}>
        <section className="section">
          <h2 className="section-title">Résumé</h2>
          <p className="about-text">{summary}</p>
        </section>
      </div>
    </div>
  );
};

export default React.memo(Template);
"""
    }
    
    # Écrire les fichiers boilerplate sur le disque
    file_paths = {}
    for filename, content in boilerplate.items():
        file_path = template_folder / filename
        if filename.endswith(".json"):
            # Use json.dumps to ensure we write a string
            file_path.write_text(json.dumps(content, indent=2, ensure_ascii=False), encoding="utf-8")
        else:
            # content is already a string for .css, .jinja2 and .tsx
            file_path.write_text(str(content), encoding="utf-8")
        file_paths[filename] = str(file_path.relative_to(BASE_DIR))

    # Créer le template en base
    # On exclut folder_name et definition car on les définit explicitement
    template_data = template_in.model_dump(exclude={"folder_name", "definition"})
    
    new_template = Template(
        **template_data,
        created_by=current_user.id,
        is_system=False,
        folder_name=template_in.slug,
        definition=boilerplate["template.json"]
    )
    
    db.add(new_template)
    db.flush() # Pour avoir l'ID
    
    # Créer les assets (liens vers les fichiers)
    for filename, rel_path in file_paths.items():
        asset_type = filename.split(".")[0] if "." in filename else "other"
        if filename == "template.jinja2": asset_type = "jinja"
        elif filename == "style.css": asset_type = "css"
        elif filename == "template.json": asset_type = "json"
        elif filename == "Template.tsx": asset_type = "react"
            
        asset = TemplateAsset(
            template_id=new_template.id,
            type=asset_type,
            file_path=rel_path
        )
        db.add(asset)
    
    db.commit()
    db.refresh(new_template)
    
    return new_template

@router.put("/{template_id}", response_model=TemplateOut)
async def update_template(
    template_id: str,
    template_in: TemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Met à jour un template"""
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template non trouvé")
    
    # Mettre à jour les champs fournis
    update_data = template_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(template, field, value)
    
    db.commit()
    db.refresh(template)
    
    return template

@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_super_admin)  # Seul super_admin peut supprimer
):
    """Supprime un template (super admin uniquement)"""
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template non trouvé")
    
    # Ne pas supprimer les templates système
    if template.is_system:
        raise HTTPException(status_code=403, detail="Impossible de supprimer un template système")
    
    db.delete(template)
    db.commit()
    
    return None

@router.patch("/{template_id}/toggle", response_model=TemplateOut)
async def toggle_template_active(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Active/désactive un template"""
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template non trouvé")
    
    template.is_active = not template.is_active
    db.commit()
    db.refresh(template)
    
    return template

@router.post("/{template_id}/generate-preview")
async def generate_template_preview(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Génère une miniature PNG haute résolution pour le template via Playwright"""
    template = db.query(Template).filter(
        (Template.id == template_id) | (Template.slug == template_id)
    ).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template non trouvé")
    
    preview_dir = STATIC_DIR / "previews"
    preview_dir.mkdir(parents=True, exist_ok=True)
    out_filename = f"{template.slug}.png"
    out_png = preview_dir / out_filename

    # Inscrire les données dummy dans le cache d'impression pour le rendu React WYSIWYG
    preview_token = f"preview_{template.slug}"
    _PRINT_CACHE[preview_token] = {
        "data": PREVIEW_DUMMY_DATA,
        "config": template.definition or {},
        "template_name": template.slug
    }

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5000")
    target_url = f"{frontend_url}/print?id={preview_token}"
    screenshot_ok = False

    # 1. Tenter le rendu React via /print (Playwright via sous-processus isolé)
    try:
        cmd = [sys.executable, str(BASE_DIR / "generate_pdf_from_html.py"), "--screenshot", "--url", target_url, "--out", str(out_png)]
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if res.returncode == 0 and out_png.exists() and out_png.stat().st_size > 500:
            screenshot_ok = True
        else:
            print(f"[Generate Preview] Notice: React print screenshot code {res.returncode}, stderr: {res.stderr}")
    except Exception as err:
        print(f"[Generate Preview] Exception: {err}, falling back to Jinja2")

    # 2. Repli Jinja2 si le rendu React n'a pas pu être capturé
    if not screenshot_ok:
        import tempfile
        temp_html_path = None
        try:
            html_content = render_html_by_name(template.slug, PREVIEW_DUMMY_DATA, config_override=template.definition or {})
            with tempfile.NamedTemporaryFile(suffix=".html", delete=False, mode="w", encoding="utf-8") as f:
                f.write(html_content)
                temp_html_path = f.name
            cmd = [sys.executable, str(BASE_DIR / "generate_pdf_from_html.py"), "--screenshot", "--html", str(temp_html_path), "--out", str(out_png)]
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            if res.returncode == 0 and out_png.exists() and out_png.stat().st_size > 500:
                screenshot_ok = True
            else:
                print(f"[Generate Preview] Jinja2 fallback stderr: {res.stderr}")
        except Exception as jinja_err:
            print(f"[Generate Preview] Jinja2 fallback failed: {jinja_err}")
        finally:
            if temp_html_path and os.path.exists(temp_html_path):
                try:
                    os.remove(temp_html_path)
                except Exception:
                    pass

    if not screenshot_ok or not out_png.exists():
        raise HTTPException(
            status_code=500,
            detail="Impossible de capturer la miniature. Assurez-vous que Playwright Chromium est disponible."
        )

    # Mettre à jour l'URL de la miniature dans le template
    preview_url = f"/static/previews/{out_filename}"
    template.preview_image = preview_url
    db.commit()
    db.refresh(template)

    return {
        "message": "Miniature générée avec succès",
        "preview_image": preview_url,
        "template_id": template.id
    }

@router.get("/{template_id}/assets", response_model=List[dict])
async def get_template_assets(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Récupère les fichiers assets d'un template"""
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template non trouvé")
    
    return template.assets

@router.get("/{template_id}/files", response_model=TemplateFiles)
async def get_template_files(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Récupère le contenu des 3 fichiers du template"""
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template non trouvé")
    
    template_folder = TEMPLATES_DIR / template.folder_name
    
    def read_file(name):
        f = template_folder / name
        return f.read_text(encoding="utf-8") if f.exists() else ""

    return {
        "template_json": read_file("template.json"),
        "style_css": read_file("style.css"),
        "template_jinja2": read_file("template.jinja2")
    }

@router.put("/{template_id}/files", response_model=TemplateFiles)
async def update_template_files(
    template_id: str,
    files_in: TemplateFiles,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Met à jour le contenu des 3 fichiers du template"""
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template non trouvé")
    
    template_folder = TEMPLATES_DIR / template.folder_name
    template_folder.mkdir(parents=True, exist_ok=True)
    
    try:
        # Écrire les fichiers
        (template_folder / "template.json").write_text(files_in.template_json, encoding="utf-8")
        (template_folder / "style.css").write_text(files_in.style_css, encoding="utf-8")
        (template_folder / "template.jinja2").write_text(files_in.template_jinja2, encoding="utf-8")
        
        # Mettre à jour la définition JSON dans la base si valide
        try:
            template.definition = json.loads(files_in.template_json)
            db.commit()
        except json.JSONDecodeError:
            pass # On garde le fichier même si le JSON est invalide (l'admin pourra corriger)

        return files_in
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'écriture des fichiers: {str(e)}")
