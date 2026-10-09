import os
import sys
from sqlalchemy import text

# Setup path
sys.path.insert(0, os.path.dirname(__file__))

from app.db.session import engine, Base
import app.main  # This imports all models

def reset_database():
    print("⚠️  Suppression de toutes les tables existantes...")
    with engine.begin() as conn:
        if "mysql" in str(engine.url):
            conn.execute(text("SET FOREIGN_KEY_CHECKS=0;"))
        
        Base.metadata.drop_all(bind=conn)
        
        # Supprimer aussi la table alembic_version manuellement si elle existe
        try:
            conn.execute(text("DROP TABLE IF EXISTS alembic_version;"))
        except:
            pass

        if "mysql" in str(engine.url):
            conn.execute(text("SET FOREIGN_KEY_CHECKS=1;"))
            
    print("✅ Toutes les tables ont été supprimées.")

if __name__ == "__main__":
    reset_database()
