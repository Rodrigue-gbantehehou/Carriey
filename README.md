# CVtor - Éditeur de CV en Temps Réel

**CVtor** est une application moderne pour créer, éditer et exporter des CV professionnels. L'application utilise une architecture hybride pour offrir une expérience d'édition fluide tout en garantissant une génération de fichiers (PDF/DOCX) de haute qualité.

## 🚀 Architecture de Rendu

L'application utilise un double système de rendu :
1.  **Rendu React (Frontend)** : Utilisé pour la prévisualisation en temps réel dans l'éditeur. Les modifications apparaissent instantanément sans appel API (Type Canva).
2.  **Rendu Jinja2 (Backend)** : Utilisé pour la génération finale des fichiers PDF et DOCX, assurant une fidélité parfaite grâce à un moteur de rendu serveur stable.

## 📁 Structure du Projet

- `/frontend` : Application Next.js 14 (React, Tailwind CSS, Zustand).
- `/backend` : API FastAPI (Python, Jinja2, Playwright pour le PDF).

## 🛠️ Installation et Démarrage

### 1. Prérequis
- Node.js 18+
- Python 3.10+

### 2. Backend (FastAPI)
Le backend gère la persistence des données et l'exportation des fichiers.

```bash
cd backend
# Créer et activer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

.\venv\Scripts\activate


# Installer les dépendances
pip install -r requirements.txt
python -m playwright install chromium

# Lancer le serveur
uvicorn api:app --reload --port 8000
```
L'API sera disponible sur `http://localhost:8000/api`.

### 3. Frontend (Next.js)
Le frontend est l'interface utilisateur interactive.

```bash
cd frontend
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```
L'application sera disponible sur `http://localhost:5000`.

## 🎨 Templates

Les templates sont stockés dans le backend (`/backend/templates`) pour le rendu Jinja2 et ont été migrés vers des composants React dans `/frontend/components/cv-templates` pour l'édition en direct.

Templates supportés en React :
- **Classique** : Design standard et épuré.
- **Moderne** : Design à deux colonnes avec sidebar.
- *Autres templates en cours de migration (utilisation du fallback Classique).*

## ⚙️ Configuration (.env)

L'application utilise des variables d'environnement pour la communication entre le frontend et le backend. Un fichier `.env` à la racine permet de centraliser la configuration.

- **`DATABASE_URL`** : URL de la base de données (PostgreSQL/Supabase).
- **`SECRET_KEY`** : Clé secrète pour les tokens JWT du backend.
- **`NEXT_PUBLIC_API_URL`** : URL du backend (ex: `http://localhost:8000/api`) pour les appels frontend.
- **`NEXTAUTH_URL`** : URL de base du frontend (ex: `http://localhost:5000`).

Assurez-vous que les ports configurés correspondent à ceux utilisés pour lancer les serveurs (`5000` pour le frontend par défaut).
