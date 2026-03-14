import os
import re
import json
import base64
import urllib.request
import unicodedata
from pathlib import Path
from typing import Dict, Any, Optional
from jinja2 import Environment, FileSystemLoader, select_autoescape
from config import settings

TEMPLATES_DIR = Path(settings.TEMPLATES_DIR)

# ── Placeholder photo (SVG avatar en base64 pour le live preview) ──────────
_PLACEHOLDER_SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#4A5568"/>
  <circle cx="100" cy="80" r="40" fill="#718096"/>
  <ellipse cx="100" cy="160" rx="60" ry="40" fill="#718096"/>
  <text x="100" y="195" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#A0AEC0">Photo de profil</text>
</svg>"""

PLACEHOLDER_PHOTO_B64 = (
    "data:image/svg+xml;base64,"
    + base64.b64encode(_PLACEHOLDER_SVG.encode()).decode()
)


def _encode_photo_to_base64(photo_value: str) -> str:
    """
    Convertit une photo en data URI base64.
    Accepte :
      - Une URL http/https  → télécharge et encode
      - Un chemin fichier   → lit et encode
      - Une data URI        → retourne tel quel
      - Vide / None         → retourne chaîne vide
    """
    if not photo_value:
        return ""
    if photo_value.startswith("data:"):
        return photo_value  # déjà encodé

    try:
        if photo_value.startswith("http://") or photo_value.startswith("https://"):
            req = urllib.request.Request(photo_value, headers={"User-Agent": "CVtor/1.0"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                raw = resp.read()
                content_type = resp.headers.get("Content-Type", "image/jpeg").split(";")[0]
        else:
            path = Path(photo_value)
            if not path.exists():
                return photo_value  # retourner tel quel si introuvable
            raw = path.read_bytes()
            ext = path.suffix.lower().lstrip(".")
            content_type = {"jpg": "image/jpeg", "jpeg": "image/jpeg",
                            "png": "image/png", "gif": "image/gif",
                            "webp": "image/webp"}.get(ext, "image/jpeg")

        encoded = base64.b64encode(raw).decode()
        return f"data:{content_type};base64,{encoded}"
    except Exception:
        return photo_value  # en cas d'erreur, retourner la valeur originale


def _prepare_data_for_render(data: Dict[str, Any], encode_photo: bool = True) -> Dict[str, Any]:
    """
    Prépare les données utilisateur pour le rendu :
    - Encode la photo en base64 si nécessaire
    """
    import copy
    data = copy.deepcopy(data)
    if encode_photo and isinstance(data.get("profile"), dict):
        photo = data["profile"].get("photo", "")
        data["profile"]["photo"] = _encode_photo_to_base64(photo)
    return data


def _slugify(text: str) -> str:
    """
    Normalise une chaîne de caractères pour en faire un slug sans accents.
    Ex: 'Créatif' -> 'creatif'
    """
    if not text:
        return ""
    # Décomposer les caractères accentués
    text = unicodedata.normalize('NFD', text)
    # Filtrer pour ne garder que les caractères non-accentués (ASCII)
    text = "".join([c for c in text if unicodedata.category(c) != 'Mn'])
    # Mettre en minuscule et supprimer les caractères non-alphanumériques (sauf - et _)
    text = text.lower()
    text = re.sub(r'[^a-z0-9_-]', '', text)
    return text


def load_template_env(template_name: str):
    """Charge l'environnement Jinja2 pour un template spécifique"""
    template_folder = _slugify(template_name)
    tpl_dir = TEMPLATES_DIR / template_folder
    if not tpl_dir.exists():
        return None
    return Environment(
        loader=FileSystemLoader(str(tpl_dir)),
        autoescape=select_autoescape(["html", "jinja2"])
    )


def assemble_html(jinja_template, css_content: str, template_metadata: Dict[str, Any], data: Dict[str, Any]) -> str:
    """Assemble le HTML final à partir du template Jinja2, du CSS et des données"""

    # Rendre le corps HTML avec les données et la configuration du template
    html_body = jinja_template.render(data=data, template=template_metadata)

    # Extraire les imports @import CSS pour les mettre dans des balises <link>
    font_links = []
    import_pattern = r"@import\s+url\(['\"]?([^'\"]+)['\"]?\);"
    imports = re.findall(import_pattern, css_content)
    for url in imports:
        font_links.append(f'<link rel="stylesheet" href="{url}" />')

    # Supprimer les @import du CSS pour les mettre dans <style>
    css_without_imports = re.sub(import_pattern, '', css_content)

    font_links_html = '\n  '.join(font_links)

    # ── Générer les CSS custom properties depuis template_metadata ──────────
    # Support ancien schéma (colors/fonts) ET nouveau schéma (tokens)
    colors = template_metadata.get("colors", {})
    fonts  = template_metadata.get("fonts",  {})
    tokens = template_metadata.get("tokens", {})
    layout = template_metadata.get("layout", {})

    # Fusion : les tokens du nouveau schéma ont priorité sur l'ancien schéma
    # On cherche aussi à la racine du metadata (pour les overrides simplifiés du frontend)
    primary   = template_metadata.get("colorPrimary")   or tokens.get("colorPrimary")   or colors.get("primary")
    secondary = template_metadata.get("colorSecondary") or tokens.get("colorSecondary") or colors.get("secondary")
    accent    = template_metadata.get("colorAccent")    or tokens.get("colorAccent")    or colors.get("accent")
    font_h    = template_metadata.get("fontHeading")    or tokens.get("fontHeading")    or fonts.get("heading")
    font_b    = template_metadata.get("fontBody")       or tokens.get("fontBody")       or fonts.get("body")

    # Tokens avancés
    sidebar_width  = template_metadata.get("sidebarWidth")   or tokens.get("sidebarWidth")   or layout.get("sidebarWidth", "35%")
    border_radius  = template_metadata.get("borderRadius")   or tokens.get("borderRadius")   or "4px"
    font_size      = template_metadata.get("fontSize")       or tokens.get("fontSize")       or 13
    line_height    = template_metadata.get("lineHeight")     or tokens.get("lineHeight")     or 1.5
    photo_shape_raw = template_metadata.get("photoShape")    or tokens.get("photoShape")    or "circle"
    spacing_raw    = template_metadata.get("spacing")        or tokens.get("spacing")        or "normal"

    # Support des noms envoyés par le frontend (backward compat & flexibilité)
    if photo_shape_raw == "round": photo_shape_raw = "circle"

    # Conversion photo-shape → valeur CSS border-radius
    photo_shape_map = {"circle": "50%", "square": border_radius, "rounded": "12px"}
    if photo_shape_raw not in photo_shape_map and str(photo_shape_raw).endswith("%"):
        photo_shape_css = photo_shape_raw
    else:
        photo_shape_css = photo_shape_map.get(photo_shape_raw, "50%")

    # Conversion spacing → multiplicateur CSS
    spacing_map = {"compact": "0.75", "normal": "1", "airy": "1.4"}
    spacing_val = spacing_map.get(spacing_raw, "1")

    css_vars_lines = []
    if primary:
        css_vars_lines.append(f"  --color-primary: {primary};")
    if secondary:
        css_vars_lines.append(f"  --color-secondary: {secondary};")
    if accent:
        css_vars_lines.append(f"  --color-accent: {accent};")
    if font_h:
        css_vars_lines.append(f"  --font-heading: '{font_h}', sans-serif;")
    if font_b:
        css_vars_lines.append(f"  --font-body: '{font_b}', sans-serif;")
    # Nouveaux tokens
    css_vars_lines.append(f"  --sidebar-width: {sidebar_width};")
    css_vars_lines.append(f"  --border-radius: {border_radius};")
    css_vars_lines.append(f"  --font-size-base: {font_size}px;")
    css_vars_lines.append(f"  --line-height: {line_height};")
    css_vars_lines.append(f"  --photo-shape: {photo_shape_css};")
    css_vars_lines.append(f"  --spacing: {spacing_val};")
    css_vars_lines.append(f"  --spacing-base: {spacing_val};") # Compatibilité Classique

    # Liens Google Fonts dynamiques (Utiliser les polices résolues !)
    google_font_links = []
    for font_name in set(filter(None, [font_h, font_b])):
        encoded = font_name.replace(" ", "+")
        google_font_links.append(
            f'<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family={encoded}:wght@400;600;700&display=swap" />'
        )

    css_vars_block = ""
    if css_vars_lines:
        css_vars_block = f":root {{\n{''.join(css_vars_lines)}\n}}"

    all_font_links = '\n  '.join(google_font_links + font_links)

    # ── Surcharges spécifiques (Preview Éditeur ou Thumbnail Galerie) ──────────
    extra_style = ""
    if template_metadata.get("is_thumbnail"):
        extra_style = """
    html, body {
      margin: 0;
      padding: 0;
      width: 210mm;
      height: 297mm;
      overflow: hidden !important;
      background: white;
    }
    .cv-container {
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      width: 210mm;
      height: 297mm;
    }
    /* Masquer les repères de page en thumbnail */
    .cv-container::before, .page-marker-container, .page-marker {
      display: none !important;
    }
    """
    elif template_metadata.get("is_preview"):
        extra_style = """
    /* ── Preview Overrides (True Paper Style) ── */
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      background: #CBD5E1;
      -webkit-print-color-adjust: exact;
    }
    
    .cv-container {
      margin: 0 auto 40px;
      width: 210mm;
      min-height: 297mm;
      height: auto;
      background: white;
      position: relative;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
    }

    /* Non-destructive page markers (Simple elegant lines on top) */
    .cv-container::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      background-image: repeating-linear-gradient(
        to bottom,
        transparent,
        transparent calc(297mm - 1px),
        rgba(239, 68, 68, 0.4) 297mm,
        rgba(239, 68, 68, 0.4) 297mm,
        transparent calc(297mm + 1px)
      );
      z-index: 100;
    }

    /* Intelligent Break Rules (Restored) */
    .section-title, h1, h2, h3 {
      break-after: avoid !important;
      page-break-after: avoid !important;
    }
    .experience-item, .education-item, .cv-section, .section {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    
    /* Widows & Orphans protection */
    p, li {
      widows: 3;
      orphans: 3;
    }

    /* Page Markers on the side */
    .page-marker-container {
      position: absolute;
      left: -80px;
      top: 0;
      height: 100%;
      width: 70px;
      pointer-events: none;
    }
    
    .page-marker {
      position: absolute;
      width: 100%;
      text-align: right;
      font-family: sans-serif;
      font-size: 10px;
      font-weight: bold;
      color: #EF4444;
      text-transform: uppercase;
      opacity: 0.6;
      padding-top: 4px;
      border-top: 1px dashed #EF4444;
    }
"""

    html_full = f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>CV Preview</title>
  {all_font_links}
  <style>
{css_without_imports}
{css_vars_block}
{extra_style}
  </style>
</head>
<body>
{html_body}
<script>
  function reportHeight() {{
    // Use document.body.scrollHeight - the most reliable cross-browser measurement
    // It always returns the full layout height regardless of overflow settings
    const body = document.body;
    const container = document.querySelector('.cv-container');
    if (!container) return;
    
    // Get the bottom edge of the cv-container relative to the page
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const totalHeight = rect.bottom + scrollTop + 20; // +20px bottom breathing room
    
    window.parent.postMessage({{ type: 'CV_HEIGHT', height: Math.ceil(totalHeight) }}, '*');
  }}
  
  // Report on load and whenever resizing happens
  window.addEventListener('load', reportHeight);
  
  if (window.ResizeObserver) {{
    const ro = new ResizeObserver(entries => {{
      reportHeight();
    }});
    const container = document.querySelector('.cv-container');
    if (container) ro.observe(container);
  }} else {{
    window.addEventListener('resize', reportHeight);
  }}

  // Periodically report as a fallback
  setInterval(reportHeight, 1000);
</script>
</body>
</html>"""
    return html_full


def render_html_from_strings(
    jinja_str: str,
    css_str: str,
    config_json: str,
    data: Dict[str, Any],
    encode_photo: bool = True
) -> str:
    """
    Rendu HTML à partir de chaînes de caractères brutes.
    Utilisé pour le live preview dans l'éditeur admin.
    """
    try:
        env = Environment(autoescape=select_autoescape(["html", "jinja2"]))
        jinja_template = env.from_string(jinja_str)

        try:
            template_metadata = json.loads(config_json) if config_json else {}
        except json.JSONDecodeError:
            template_metadata = {}

        prepared_data = _prepare_data_for_render(data, encode_photo=encode_photo)
        return assemble_html(jinja_template, css_str, template_metadata, prepared_data)
    except Exception as e:
        return (
            "<html><body>"
            "<div style='color:#e53e3e;padding:20px;font-family:monospace;background:#fff5f5;"
            "border-left:4px solid #e53e3e;margin:20px;border-radius:4px'>"
            f"<strong>Erreur de rendu Jinja2</strong><br><br><pre>{str(e)}</pre>"
            "</div></body></html>"
        )


def render_html_by_name(template_name: str, data: Dict[str, Any], config_override: Optional[Dict[str, Any]] = None, encode_photo: bool = True) -> str:
    """Rendu HTML à partir du nom du template (depuis le disque)"""
    template_folder = _slugify(template_name)
    env = load_template_env(template_folder)
    if not env:
        return f"<html><body>Template '{template_name}' non trouvé</body></html>"

    template_file = "template.jinja2"
    jinja_template = env.get_template(template_file)

    css_path = TEMPLATES_DIR / template_folder / "style.css"
    css_content = css_path.read_text(encoding="utf-8") if css_path.exists() else ""

    template_json_path = TEMPLATES_DIR / template_folder / "template.json"
    template_metadata = {}
    if template_json_path.exists():
        template_metadata = json.loads(template_json_path.read_text(encoding="utf-8"))

    # Surcharge de la configuration si fournie
    if config_override:
        template_metadata.update(config_override)

    prepared_data = _prepare_data_for_render(data, encode_photo=encode_photo)
    return assemble_html(jinja_template, css_content, template_metadata, prepared_data)
