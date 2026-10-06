import os
import sys

# Ajouter le chemin du projet au PYTHONPATH
sys.path.insert(0, os.path.dirname(__file__))

# Charger les variables d'environnement
# Priorité : .env.production > .env (selon ENVIRONMENT)
from dotenv import load_dotenv

_base = os.path.dirname(__file__)
_env_prod = os.path.join(_base, ".env.production")
_env_default = os.path.join(_base, ".env")

if os.path.exists(_env_prod):
    load_dotenv(_env_prod, override=True)
elif os.path.exists(_env_default):
    load_dotenv(_env_default)

# Importer l'application FastAPI
from app.main import app as fastapi_app

# Convertir l'application ASGI (FastAPI) en WSGI pour Passenger (cPanel/O2Switch)
try:
    from a2wsgi import ASGIMiddleware
    # wait_time=300s : le service PDF Render peut prendre jusqu'à 90 secondes
    application = ASGIMiddleware(fastapi_app, wait_time=300)
except ImportError:
    raise ImportError("Le module 'a2wsgi' est requis pour lancer FastAPI sur O2Switch. Ajoutez 'a2wsgi' à vos dépendances.")
