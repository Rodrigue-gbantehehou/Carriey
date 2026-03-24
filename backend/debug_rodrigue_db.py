import json
import os
import sys
from pathlib import Path

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.template import Template

# Setup Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cvtor.db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_rodrigue():
    db = SessionLocal()
    try:
        t = db.query(Template).filter(Template.slug == "rodrigue").first()
        if t:
            print(f"Template Name: {t.name}")
            print(f"Slug: {t.slug}")
            print(f"Price: {t.price}")
            print(f"Is Active: {t.is_active}")
            print("Definition Full:")
            print(json.dumps(t.definition, indent=2))
        else:
            print("Rodrigue not found in DB")
    finally:
        db.close()

if __name__ == "__main__":
    check_rodrigue()
