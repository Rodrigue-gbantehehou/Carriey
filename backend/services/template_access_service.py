"""
Service de gestion des accès aux templates
"""
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
from models.user_template_access import UserTemplateAccess
from models.template import Template
from models.payment import Payment

class TemplateAccessService:
    """Service pour gérer les accès utilisateurs aux templates"""
    
    @staticmethod
    def check_user_access(db: Session, user_id: str, template_id: str) -> bool:
        """
        Vérifie si un utilisateur a accès à un template
        
        Args:
            db: Session de base de données
            user_id: ID de l'utilisateur
            template_id: ID du template
            
        Returns:
            True si l'utilisateur a accès, False sinon
        """
        # Récupérer le template
        template = db.query(Template).filter(Template.id == template_id).first()
        
        if not template:
            return False
        
        # Si le template n'est pas actif, seuls les admins peuvent y accéder
        if not template.is_active:
            return False
        
        # Si le template est gratuit (price = 0), tout le monde a accès
        if template.price == 0:
            return True
        
        # Sinon, vérifier si l'utilisateur a un accès enregistré
        access = db.query(UserTemplateAccess).filter(
            UserTemplateAccess.user_id == user_id,
            UserTemplateAccess.template_id == template_id
        ).first()
        
        if not access:
            return False
        
        # Vérifier si l'accès n'a pas expiré
        if access.expires_at and access.expires_at < datetime.now():
            return False
        
        return True
    
    @staticmethod
    def grant_access(
        db: Session, 
        user_id: str, 
        template_id: str, 
        payment_id: Optional[str] = None,
        expires_at: Optional[datetime] = None
    ) -> UserTemplateAccess:
        """
        Donne accès à un template à un utilisateur
        
        Args:
            db: Session de base de données
            user_id: ID de l'utilisateur
            template_id: ID du template
            payment_id: ID du paiement (optionnel)
            expires_at: Date d'expiration de l'accès (optionnel)
            
        Returns:
            L'objet UserTemplateAccess créé
        """
        # Vérifier si l'accès existe déjà
        existing_access = db.query(UserTemplateAccess).filter(
            UserTemplateAccess.user_id == user_id,
            UserTemplateAccess.template_id == template_id
        ).first()
        
        if existing_access:
            # Mettre à jour l'accès existant
            if payment_id:
                existing_access.payment_id = payment_id
            if expires_at:
                existing_access.expires_at = expires_at
            db.commit()
            db.refresh(existing_access)
            return existing_access
        
        # Créer un nouvel accès
        access = UserTemplateAccess(
            user_id=user_id,
            template_id=template_id,
            payment_id=payment_id,
            expires_at=expires_at
        )
        db.add(access)
        db.commit()
        db.refresh(access)
        return access
    
    @staticmethod
    def revoke_access(db: Session, user_id: str, template_id: str) -> bool:
        """
        Révoque l'accès d'un utilisateur à un template
        
        Args:
            db: Session de base de données
            user_id: ID de l'utilisateur
            template_id: ID du template
            
        Returns:
            True si l'accès a été révoqué, False sinon
        """
        access = db.query(UserTemplateAccess).filter(
            UserTemplateAccess.user_id == user_id,
            UserTemplateAccess.template_id == template_id
        ).first()
        
        if access:
            db.delete(access)
            db.commit()
            return True
        
        return False
    
    @staticmethod
    def get_user_templates(db: Session, user_id: str) -> list:
        """
        Récupère tous les templates auxquels un utilisateur a accès
        
        Args:
            db: Session de base de données
            user_id: ID de l'utilisateur
            
        Returns:
            Liste des templates accessibles
        """
        # Templates gratuits
        free_templates = db.query(Template).filter(
            Template.is_active == True,
            Template.price == 0
        ).all()
        
        # Templates payants avec accès
        paid_accesses = db.query(UserTemplateAccess).filter(
            UserTemplateAccess.user_id == user_id
        ).all()
        
        paid_template_ids = [access.template_id for access in paid_accesses]
        paid_templates = db.query(Template).filter(
            Template.id.in_(paid_template_ids),
            Template.is_active == True
        ).all()
        
        # Combiner les deux listes
        all_templates = list(free_templates) + list(paid_templates)
        
        # Supprimer les doublons
        unique_templates = {t.id: t for t in all_templates}.values()
        
        return list(unique_templates)
