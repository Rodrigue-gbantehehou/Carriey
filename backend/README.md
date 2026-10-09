# Carriey

**Carriey** est une application complète pour générer, éditer et exporter des CV à partir de modèles personnalisables, avec une interface web moderne et une API Python.

## Fonctionnalités

- Édition de CV via une interface web (Next.js/React)
- Génération de CV en PDF et DOCX
- Modèles de CV personnalisables (Jinja2, JSON)
- Prévisualisation en temps réel
- Génération de contenu assistée par IA (optionnel)
- API REST pour l’intégration et l’automatisation

## Structure du projet

- `app/main.py` : Point d'entrée de l'API FastAPI
- `app/api/` : Routeurs et points d'accès de l'API
- `app/models/` : Modèles de base de données SQLAlchemy
- `generate_pdf_from_html.py` : Conversion HTML → PDF via Playwright
- `export_docx.py` : Export DOCX à partir de données JSON
- `mail_templates/` : Modèles d'emails

## Installation

### Prérequis

- Python 3.10+
- [Playwright](https://playwright.dev/python/) (pour l’export PDF)

### Backend

```sh
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m playwright install chromium
uvicorn app.main:app --reload
```
