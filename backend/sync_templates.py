import json
import os
import sys
from pathlib import Path

# Add current directory to path so we can import from local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from models.template import Template
    from config import settings
except ImportError as e:
    print(f"Import error: {e}")
    sys.exit(1)

# Setup Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cvtor.db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Use the templates directory from settings
TEMPLATES_DIR = Path(settings.TEMPLATES_DIR)

def sync():
    db = SessionLocal()
    try:
        templates = db.query(Template).all()
        
        if not templates:
            print("No templates found in database.")
            return

        for tpl in templates:
            # The slug should match the folder name
            json_path = TEMPLATES_DIR / tpl.slug / "template.json"
            if json_path.exists():
                print(f"Syncing {tpl.slug} from {json_path}...")
                try:
                    with open(json_path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        tpl.definition = data
                        print(f"  Successfully updated definition for {tpl.slug}")
                except Exception as e:
                    print(f"  Error reading {json_path}: {e}")
            else:
                print(f"  Warning: {json_path} not found.")
        
        db.commit()
        print("\nSynchronization complete!")
    except Exception as e:
        print(f"Error during sync: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    sync()
