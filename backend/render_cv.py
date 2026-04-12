#!/usr/bin/env python3
"""
Rendu HTML d'un CV à partir d'un template Jinja2 et de données JSON.
Sortie : un fichier HTML compatible avec vos styles existants.
Usage :
    python render_cv.py --template moderne --data data/resume_marlyse.json --out cv.html
"""

import json
import argparse
from pathlib import Path
from jinja2 import Environment, FileSystemLoader, select_autoescape


def load_json(path: Path):
    """Charge un fichier JSON et renvoie un dict."""
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def render(template_name: str, data_json_path: Path, out_html_path: Path):
    base_dir = Path(__file__).parent
    template_dir = base_dir / "templates" / template_name

    if not template_dir.exists():
        raise FileNotFoundError(f"Le modèle '{template_name}' est introuvable dans templates/")

    # ✅ Charger les données JSON
    data_json = load_json(data_json_path)

    # ✅ Charger le fichier meta.json s’il existe (infos sur le modèle)
    meta_path = template_dir / "meta.json"
    template_meta = load_json(meta_path) if meta_path.exists() else {"templateName": template_name}

    env = Environment(
        loader=FileSystemLoader(str(template_dir)),
        autoescape=select_autoescape(["html", "xml"]),
        trim_blocks=True,
        lstrip_blocks=True,
    )

    jinja_tpl = env.get_template("template.jinja2")

    # ✅ On passe maintenant data **et** template
    html = jinja_tpl.render(data=data_json, template=template_meta)

    out_html_path.write_text(html, encoding="utf-8")
    return out_html_path
