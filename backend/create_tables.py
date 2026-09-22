import os
import sys
from urllib.parse import urlparse
import pymysql

if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    try:
        getattr(sys.stdout, "reconfigure")(encoding="utf-8")
    except Exception:
        pass

from database import engine, Base, DATABASE_URL
from models import *

def ensure_database_exists():
    """Vérifie et crée la base MySQL si elle n'existe pas encore"""
    if "mysql" in DATABASE_URL:
        try:
            # Parse l'URL pour extraire host, port, user, password, dbname
            raw = DATABASE_URL.replace("mysql+pymysql://", "mysql://")
            parsed = urlparse(raw)
            db_name = parsed.path.lstrip("/").split("?")[0]
            
            if db_name:
                conn = pymysql.connect(
                    host=parsed.hostname or "localhost",
                    user=parsed.username or "root",
                    password=parsed.password or "",
                    port=parsed.port or 3306
                )
                with conn.cursor() as cursor:
                    cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
                conn.close()
                print(f"✅ Base de données MySQL `{db_name}` prête.")
        except Exception as e:
            print(f"⚠️ Note création base: {e}")

def init_db():
    print("Initialisation de la base de données...")
    ensure_database_exists()
    Base.metadata.create_all(bind=engine)
    print("✅ Tables créées avec succès.")

if __name__ == "__main__":
    init_db()
