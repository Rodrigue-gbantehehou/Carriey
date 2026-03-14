from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path
import uuid

from database import get_db
from models.user import User
from models.resume import Resume
from models.export import Export, ExportFormat, ExportStatus
from models.template import Template
from schemas.export import ExportCreate, ExportOut, ExportListOut
from auth.deps import get_current_active_user

router = APIRouter(prefix="/exports", tags=["exports"])

BASE_DIR = Path(__file__).parent.parent.resolve()
TEMPLATES_DIR = BASE_DIR / "templates"

def render_html_from_resume(resume: Resume, template: Template) -> str:
    """Génère le HTML à partir d'un resume et son template"""
    from jinja2 import Environment, FileSystemLoader, select_autoescape
    
    template_folder = template.folder_name.lower()
    tpl_dir = TEMPLATES_DIR / template_folder
    
    env = Environment(
        loader=FileSystemLoader(str(tpl_dir)),
        autoescape=select_autoescape(["html", "jinja2"])
    )
    
    jinja_template = env.get_template("template.jinja2")
    
    # Charger le CSS
    css_path = tpl_dir / "style.css"
    css_content = css_path.read_text(encoding="utf-8") if css_path.exists() else ""
    
    # Extraire les @import pour les fonts
    import re
    font_links = []
    import_pattern = r"@import\s+url\(['\"]?([^'\"]+)['\"]?\);"
    imports = re.findall(import_pattern, css_content)
    for url in imports:
        font_links.append(f'<link rel="stylesheet" href="{url}" />')
    css_without_imports = re.sub(import_pattern, '', css_content)
    
    html_body = jinja_template.render(data=resume.content, template=template.definition)
    font_links_html = '\n  '.join(font_links)
    
    html_full = f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>{resume.title}</title>
  {font_links_html}
  <style>{css_without_imports}</style>
</head>
<body>
{html_body}
</body>
</html>"""
    
    return html_full

async def generate_pdf_task(export_id: str, resume: Resume, template: Template, db: Session):
    """Tâche en arrière-plan pour générer le PDF"""
    from generate_pdf_from_html import html_to_pdf
    
    try:
        # Générer HTML
        html_content = render_html_from_resume(resume, template)
        
        # Fichiers temporaires
        tmp_html = BASE_DIR / f"_tmp_export_{export_id}.html"
        tmp_html.write_text(html_content, encoding="utf-8")
        
        # Générer PDF
        output_pdf = BASE_DIR / f"export_{export_id}.pdf"
        html_to_pdf(tmp_html, output_pdf)
        
        # Nettoyer HTML temporaire
        tmp_html.unlink(missing_ok=True)
        
        # Mettre à jour l'export
        export = db.query(Export).filter(Export.id == export_id).first()
        if export:
            export.status = ExportStatus.DONE
            export.file_url = f"/static/export_{export_id}.pdf"
            db.commit()
            
    except Exception as e:
        # Marquer comme failed
        export = db.query(Export).filter(Export.id == export_id).first()
        if export:
            export.status = ExportStatus.FAILED
            export.meta_data = {"error": str(e)}
            db.commit()

@router.post("/", response_model=ExportOut, status_code=status.HTTP_201_CREATED)
async def create_export(
    export_in: ExportCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Crée un export PDF/DOCX d'un CV"""
    # Vérifier que le resume appartient à l'utilisateur
    resume = db.query(Resume).filter(
        Resume.id == export_in.resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="CV non trouvé")
    
    # Récupérer le template
    template = db.query(Template).filter(Template.id == resume.template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template non trouvé")
    
    # Créer l'export
    new_export = Export(
        resume_id=export_in.resume_id,
        format=ExportFormat.PDF if export_in.format.lower() == "pdf" else ExportFormat.DOCX,
        status=ExportStatus.QUEUED
    )
    
    db.add(new_export)
    db.commit()
    db.refresh(new_export)
    
    # Lancer la génération en arrière-plan (pour PDF uniquement pour l'instant)
    if export_in.format.lower() == "pdf":
        new_export.status = ExportStatus.RUNNING
        db.commit()
        background_tasks.add_task(generate_pdf_task, new_export.id, resume, template, db)
    else:
        # DOCX non implémenté pour l'instant
        new_export.status = ExportStatus.FAILED
        new_export.meta_data = {"error": "Format DOCX non encore implémenté"}
        db.commit()
    
    return new_export

@router.get("/resume/{resume_id}", response_model=List[ExportListOut])
async def list_resume_exports(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Liste tous les exports d'un CV"""
    # Vérifier que le resume appartient à l'utilisateur
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="CV non trouvé")
    
    exports = db.query(Export).filter(Export.resume_id == resume_id).all()
    return exports

@router.get("/{export_id}", response_model=ExportOut)
async def get_export(
    export_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Récupère les détails d'un export"""
    export = db.query(Export).filter(Export.id == export_id).first()
    
    if not export:
        raise HTTPException(status_code=404, detail="Export non trouvé")
    
    # Vérifier que le resume appartient à l'utilisateur
    resume = db.query(Resume).filter(
        Resume.id == export.resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    return export

@router.get("/{export_id}/download")
async def download_export(
    export_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Télécharge un fichier exporté"""
    export = db.query(Export).filter(Export.id == export_id).first()
    
    if not export:
        raise HTTPException(status_code=404, detail="Export non trouvé")
    
    # Vérifier que le resume appartient à l'utilisateur
    resume = db.query(Resume).filter(
        Resume.id == export.resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    # Vérifier que l'export est terminé
    if export.status != ExportStatus.DONE:
        raise HTTPException(status_code=400, detail="Export pas encore prêt")
    
    if not export.file_url:
        raise HTTPException(status_code=404, detail="Fichier non trouvé")
    
    # Construire le chemin du fichier
    file_path = BASE_DIR / export.file_url.replace("/static/", "")
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Fichier non trouvé")
    
    return FileResponse(
        path=file_path,
        filename=f"{resume.title}.{export.format.value}",
        media_type="application/pdf" if export.format == ExportFormat.PDF else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
