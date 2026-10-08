import os
import sys

# Ajouter le répertoire racine au PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN accepted_terms_version VARCHAR(50) DEFAULT '1.0' NOT NULL;"))
            conn.commit()
            print("Migration successful: added accepted_terms_version to users")
        except Exception as e:
            if "duplicate column name" in str(e).lower() or "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
                print("Column already exists")
            else:
                print(f"Error during migration: {e}")

if __name__ == "__main__":
    migrate()
