import os
import json
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse

from database import get_db
from models.user import User
from models.template import Template, TemplateAsset
from schemas.template import TemplateOut
from auth.deps import get_current_admin

router = APIRouter(prefix="/admin/templates/upload", tags=["admin-templates-upload"])

@router.post("/create", response_model=TemplateOut, status_code=status.HTTP_201_CREATED)
async def create_template_from_files(
    name: str,
    slug: str,
    description: str = "",
    price: float = 0.0,
    currency: str = "XOF",
    is_active: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    template_json: UploadFile = File(...),
    style_css: UploadFile = File(...),
    template_jinja2: UploadFile = File(...),
    preview_image: UploadFile = File(None)
):
    """Crée un nouveau template à partir des fichiers uploadés"""
    
    # Vérifier que le slug n'existe pas déjà
    existing = db.query(Template).filter(Template.slug == slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Un template avec ce slug existe déjà")
    
    # Créer le dossier pour le template
    template_folder = f"templates/{slug}"
    os.makedirs(template_folder, exist_ok=True)
    
    try:
        # Sauvegarder les fichiers
        file_paths = {}
        
        # Sauvegarder template.json
        json_content = await template_json.read()
        json_path = os.path.join(template_folder, "template.json")
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(json.loads(json_content.decode('utf-8')), f, indent=2, ensure_ascii=False)
        file_paths['json'] = json_path
        
        # Sauvegarder style.css
        css_content = await style_css.read()
        css_path = os.path.join(template_folder, "style.css")
        with open(css_path, 'w', encoding='utf-8') as f:
            f.write(css_content.decode('utf-8'))
        file_paths['css'] = css_path
        
        # Sauvegarder template.jinja2
        jinja_content = await template_jinja2.read()
        jinja_path = os.path.join(template_folder, "template.jinja2")
        with open(jinja_path, 'w', encoding='utf-8') as f:
            f.write(jinja_content.decode('utf-8'))
        file_paths['jinja'] = jinja_path
        
        # Sauvegarder l'image de prévisualisation si fournie
        preview_path = ""
        if preview_image:
            preview_filename = f"preview_{uuid.uuid4().hex}.{preview_image.filename.split('.')[-1]}"
            preview_path = os.path.join(template_folder, preview_filename)
            with open(preview_path, 'wb') as f:
                f.write(await preview_image.read())
        
        # Charger la configuration du template
        template_config = json.loads(json_content.decode('utf-8'))
        
        # Créer le template dans la base de données
        new_template = Template(
            slug=slug,
            name=name,
            description=description,
            price=price,
            currency=currency,
            preview_image=preview_path,
            folder_name=slug,
            definition=template_config,
            version=1,
            is_active=is_active,
            is_system=False,
            created_by=current_user.id
        )
        
        db.add(new_template)
        db.flush()  # Pour obtenir l'ID
        
        # Créer les assets
        assets = [
            TemplateAsset(
                template_id=new_template.id,
                type="json",
                file_path=file_paths['json']
            ),
            TemplateAsset(
                template_id=new_template.id,
                type="css",
                file_path=file_paths['css']
            ),
            TemplateAsset(
                template_id=new_template.id,
                type="jinja",
                file_path=file_paths['jinja']
            )
        ]
        
        if preview_path:
            assets.append(TemplateAsset(
                template_id=new_template.id,
                type="preview",
                file_path=preview_path
            ))
        
        for asset in assets:
            db.add(asset)
        
        db.commit()
        db.refresh(new_template)
        
        return new_template
        
    except Exception as e:
        # Nettoyer les fichiers en cas d'erreur
        db.rollback()
        # Supprimer le dossier créé
        import shutil
        if os.path.exists(template_folder):
            shutil.rmtree(template_folder)
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création du template: {str(e)}")

@router.get("/template-structure")
async def get_template_structure():
    """Retourne la structure attendue pour un template"""
    return {
        "description": "Structure attendue pour un template CVtor",
        "files": {
            "template.json": {
                "description": "Configuration du template",
                "required_fields": [
                    "templateName",
                    "fonts.heading", 
                    "fonts.body",
                    "colors.primary",
                    "colors.secondary",
                    "layout",
                    "sections"
                ],
                "example": {
                    "templateName": "Mon Template",
                    "fonts": {
                        "heading": "Montserrat",
                        "body": "Open Sans"
                    },
                    "colors": {
                        "primary": "#2D3748",
                        "secondary": "#F7FAFC",
                        "accent": "#805AD5"
                    },
                    "layout": {
                        "twoColumn": true,
                        "sidebarWidth": "35%"
                    },
                    "sections": [
                        {"type": "contact", "label": "Contact"},
                        {"type": "summary", "label": "Résumé"}
                    ]
                }
            },
            "style.css": {
                "description": "Feuille de styles CSS",
                "requirements": [
                    "Doit inclure les classes utilisées dans template.jinja2",
                    "Doit être compatible avec l'impression PDF"
                ]
            },
            "template.jinja2": {
                "description": "Template Jinja2 pour la structure HTML",
                "variables_disponibles": [
                    "data.profile",
                    "data.experience",
                    "data.education", 
                    "data.skills",
                    "data.languages",
                    "data.projects"
                ]
            }
        }
    }
