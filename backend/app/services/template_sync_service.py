"""
Service de synchronisation des templates depuis le filesystem
"""
import json
from pathlib import Path
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.template import Template

class TemplateSyncService:
    """Service pour synchroniser les templates du filesystem vers la base de données"""
    
    def __init__(self, templates_dir: Path):
        self.templates_dir = templates_dir
    
    def sync_templates(self, db: Session) -> Dict[str, Any]:
        """
        Synchronise tous les templates du filesystem vers la base de données
        
        Args:
            db: Session de base de données
            
        Returns:
            Dictionnaire avec les statistiques de synchronisation
        """
        result = {
            "synced": 0,
            "created": 0,
            "updated": 0,
            "errors": []
        }
        
        # Parcourir tous les dossiers de templates
        for template_folder in self.templates_dir.iterdir():
            if not template_folder.is_dir():
                continue
            
            try:
                # Charger le fichier template.json
                template_json_path = template_folder / "template.json"
                if not template_json_path.exists():
                    result["errors"].append(f"Fichier template.json manquant dans {template_folder.name}")
                    continue
                
                with open(template_json_path, "r", encoding="utf-8") as f:
                    template_definition = json.load(f)
                
                # Vérifier si le template existe déjà
                slug = template_folder.name.lower()
                existing_template = db.query(Template).filter(Template.slug == slug).first()
                
                if existing_template:
                    # Mettre à jour le template existant
                    existing_template.definition = template_definition
                    existing_template.folder_name = template_folder.name
                    existing_template.name = template_definition.get("templateName", template_folder.name)
                    result["updated"] += 1
                else:
                    # Créer un nouveau template
                    new_template = Template(
                        slug=slug,
                        name=template_definition.get("templateName", template_folder.name),
                        description=f"Template {template_definition.get('templateName', template_folder.name)}",
                        folder_name=template_folder.name,
                        definition=template_definition,
                        price=0,  # Par défaut gratuit
                        currency="XOF",
                        is_active=True,
                        is_system=True  # Templates du filesystem sont système
                    )
                    db.add(new_template)
                    result["created"] += 1
                
                result["synced"] += 1
                
            except Exception as e:
                result["errors"].append(f"Erreur lors de la synchronisation de {template_folder.name}: {str(e)}")
        
        db.commit()
        return result
    
    def get_template_preview_path(self, template_slug: str) -> Path:
        """
        Retourne le chemin vers l'image de preview d'un template
        
        Args:
            template_slug: Slug du template
            
        Returns:
            Path vers l'image de preview (ou None si inexistante)
        """
        template_folder = self.templates_dir / template_slug
        
        # Chercher les fichiers d'image courants
        for ext in [".png", ".jpg", ".jpeg", ".webp"]:
            preview_path = template_folder / f"preview{ext}"
            if preview_path.exists():
                return preview_path
        
        return None
