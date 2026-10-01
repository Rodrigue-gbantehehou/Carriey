# Utiliser l'image officielle Playwright qui contient déjà Python et les dépendances système
FROM mcr.microsoft.com/playwright/python:v1.40.0-jammy

# Éviter les questions interactives
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# Dossier de travail
WORKDIR /app

# Copier les dépendances du backend
COPY backend/requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Installer Chromium via Playwright
RUN playwright install chromium

# Copier le code du backend
COPY backend/ .

# Copier les templates du frontend (nécessaires pour le rendu PDF/DOCX côté serveur)
# On les place dans un dossier /app/templates
COPY frontend/components/app/cv/templates/ ./templates/

# Définir le chemin des templates pour l'application
ENV TEMPLATES_DIR=/app/templates
ENV DATA_DIR=/app/data

# Créer les dossiers nécessaires
RUN mkdir -p static data templates

# Exposer le port par défaut de Render
EXPOSE 10000

# Lancer l'application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000", "--forwarded-allow-ips='*'"]
