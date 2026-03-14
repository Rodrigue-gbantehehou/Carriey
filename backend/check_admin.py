#!/usr/bin/env python3
"""
Script pour vérifier et créer un utilisateur admin par défaut
"""

import hashlib
from sqlalchemy.orm import Session
from database import engine, get_db
from models.user import User

def create_admin_user():
    """Crée un utilisateur admin par défaut si aucun n'existe"""
    
    # Créer une session
    db = Session(engine)
    
    try:
        # Vérifier si un admin existe déjà
        existing_admin = db.query(User).filter(
            (User.role == 'SUPER_ADMIN') | (User.role == 'ADMIN')
        ).first()
        
        if existing_admin:
            print(f"✅ Utilisateur admin existe déjà : {existing_admin.email} (role: {existing_admin.role})")
            return
        
        # Créer un admin par défaut
        from auth.auth import get_password_hash
        
        admin_user = User(
            email="admin@cvtor.com",
            full_name="Admin CVtor",
            role="SUPER_ADMIN",
            hashed_password=get_password_hash("admin123"),
            is_active=True,
            is_verified=True
        )
        
        db.add(admin_user)
        db.commit()
        
        print("✅ Utilisateur admin créé avec succès :")
        print("   Email: admin@cvtor.com")
        print("   Mot de passe: admin123")
        print("   Role: SUPER_ADMIN")
        print("\n⚠️  Pensez à changer le mot de passe en production !")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erreur lors de la création de l'admin: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
