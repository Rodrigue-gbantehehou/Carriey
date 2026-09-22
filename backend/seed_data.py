import os
import sys
import json
import uuid
from pathlib import Path

if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    try:
        getattr(sys.stdout, "reconfigure")(encoding="utf-8")
    except Exception:
        pass

from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal, Base
from app.models.user import User, UserRole
from app.models.template import Template
from app.models.persona import Persona
from app.core.security import get_password_hash

BASE_DIR = Path(__file__).parent.resolve()
TEMPLATES_DIR = BASE_DIR.parent / "frontend" / "components" / "cv-templates"

def seed_admin_user(db: Session):
    """Créer un utilisateur super admin par défaut"""
    admin_email = "admin@cvtor.com"
    
    # Vérifier si l'admin existe déjà
    existing_admin = db.query(User).filter(User.email == admin_email).first()
    if existing_admin:
        print(f"✅ Admin user already exists: {admin_email}")
        return existing_admin
    
    # Créer l'admin
    admin_user = User(
        email=admin_email,
        hashed_password=get_password_hash("admin123"),  # Changez ce mot de passe en production!
        full_name="Administrateur",
        role=UserRole.SUPER_ADMIN,
        is_active=True
    )
    
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    print(f"✅ Created super admin: {admin_email} / admin123")
    return admin_user

def seed_templates(db: Session, admin_user: User):
    """Créer les templates depuis les dossiers existants"""
    template_folders = ["professional", "moderne", "classique", "tokyo", "letter_classique", "letter_moderne", "letter_professional"]
    
    for folder_name in template_folders:
        template_dir = TEMPLATES_DIR / folder_name
        if not template_dir.exists():
            print(f"⚠️  Template folder not found: {folder_name}")
            continue
        
        # Vérifier si le template existe déjà
        existing_template = db.query(Template).filter(Template.slug == folder_name).first()
        if existing_template:
            print(f"✅ Template already exists: {folder_name}")
            continue
        
        # Charger template.json
        template_json_path = template_dir / "template.json"
        definition = {}
        if template_json_path.exists():
            with open(template_json_path, 'r', encoding='utf-8') as f:
                definition = json.load(f)
        
        # Déterminer le prix (gratuit pour classique, payant pour les autres)
        price = 0 if folder_name == "classique" else 2500  # 2500 XOF
        
        # Créer le template
        template = Template(
            slug=folder_name,
            name=definition.get("templateName", folder_name.capitalize()),
            description=f"Template {folder_name} pour CV professionnel",
            price=price,
            currency="XOF",
            folder_name=folder_name,
            definition=definition,
            template_type=definition.get("template_type", "cv"),
            is_active=True,
            is_system=True,
            created_by=admin_user.id
        )
        
        db.add(template)
        print(f"✅ Created template: {folder_name} ({price} XOF)")
    
    db.commit()

def seed_test_user(db: Session):
    """Créer un utilisateur de test"""
    test_email = "user@test.com"
    
    existing_user = db.query(User).filter(User.email == test_email).first()
    if existing_user:
        print(f"✅ Test user already exists: {test_email}")
        return
    
    test_user = User(
        email=test_email,
        hashed_password=get_password_hash("test123"),
        full_name="Utilisateur Test",
        role=UserRole.USER,
        is_active=True
    )
    
    db.add(test_user)
    db.commit()
    
    print(f"✅ Created test user: {test_email} / test123")

def seed_personas(db: Session):
    """Créer des personas variés (secteurs et expériences)"""
    from lib.personas import PERSONAS
    
    for p_info in PERSONAS:
        sector = p_info.get('sector')
        levels = p_info.get('levels')
        if not isinstance(levels, dict):
            continue
        
        for level_id, content in levels.items():
            existing = db.query(Persona).filter(
                Persona.sector == sector,
                Persona.experience_level == level_id
            ).first()
            
            if existing:
                existing.content_json = content
                print(f"✅ Updated persona: {sector} ({level_id})")
            else:
                persona = Persona(
                    sector=sector,
                    experience_level=level_id,
                    content_json=content
                )
                db.add(persona)
                print(f"✅ Created persona: {sector} ({level_id})")

    db.commit()

def main():
    print("🌱 Starting database seeding...")
    
    # S'assurer que les tables existent
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Créer admin
        admin_user = seed_admin_user(db)
        
        # 2. Créer templates
        seed_templates(db, admin_user)
        
        # 3. Créer utilisateur de test
        seed_test_user(db)
        
        # 4. Créer personas
        seed_personas(db)
        
        print("\n✅ Database seeding completed successfully!")
        print("\n📝 Credentials:")
        print("   Admin: admin@cvtor.com / admin123")
        print("   User:  user@test.com / test123")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
