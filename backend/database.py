from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Récupérer l'URL de la base de données depuis les variables d'environnement
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cvtor.db")

# Pour SQLite, on a besoin de cette option pour gérer les requêtes multithread
# Pour SQLite, on a besoin de cette option pour gérer les requêtes multithread
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
# Pour MySQL, TiDB et autres
else:
    # ssl_args pour TiDB Cloud et autres services sécurisés
    connect_args = {}
    if "mysql" in DATABASE_URL:
        # TiDB Cloud nécessite SSL. Sur Render et la plupart des plateformes Linux, 
        # le certificat CA système est suffisant pour vérifier l'identité du serveur.
        connect_args["ssl"] = {"reject_unauthorized": True}
        
    # pool_pre_ping=True est important pour les bases cloud qui coupent les connexions inactives
    engine = create_engine(
        DATABASE_URL, 
        connect_args=connect_args,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dépendance pour obtenir une session de base de données"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
