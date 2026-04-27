"""
Service de gestion des paiements kkiapay
"""
import httpx
from typing import Optional, Dict, Any
from decimal import Decimal
from config.kkiapay import KkiapayConfig

class KkiapayService:
    """Service pour interagir avec l'API kkiapay"""
    
    BASE_URL_SANDBOX = "https://api-sandbox.kkiapay.me"
    BASE_URL_PROD = "https://api.kkiapay.me"
    
    def __init__(self):
        self.config = KkiapayConfig()
        self.base_url = self.BASE_URL_SANDBOX if self.config.SANDBOX else self.BASE_URL_PROD
        
        if not self.config.is_configured():
            raise ValueError("kkiapay n'est pas correctement configuré. Vérifiez vos variables d'environnement.")
    
    def _get_headers(self) -> Dict[str, str]:
        """Retourne les headers pour les requêtes API"""
        return {
            "x-api-key": self.config.PRIVATE_KEY,
            "Content-Type": "application/json"
        }
    
    async def verify_transaction(self, transaction_id: str) -> Dict[str, Any]:
        """
        Vérifie le statut d'une transaction kkiapay
        
        Args:
            transaction_id: ID de la transaction kkiapay
            
        Returns:
            Dict contenant les détails de la transaction
            
        Raises:
            httpx.HTTPError: Si la requête échoue
        """
        url = f"{self.base_url}/api/v1/transactions/{transaction_id}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self._get_headers(), timeout=30.0)
            response.raise_for_status()
            return response.json()
    
    def get_widget_config(self, amount: Decimal, reason: str, template_id: str) -> Dict[str, Any]:
        """
        Retourne la configuration pour le widget kkiapay côté client
        
        Args:
            amount: Montant à payer
            reason: Raison du paiement
            template_id: ID du template acheté
            
        Returns:
            Dict avec la configuration du widget
        """
        return {
            "public_key": self.config.PUBLIC_KEY,
            "amount": float(amount),
            "reason": reason,
            "sandbox": self.config.SANDBOX,
            "data": template_id  # Données personnalisées à récupérer dans le callback
        }
    
    async def validate_webhook_signature(self, payload: Dict[str, Any], signature: str) -> bool:
        """
        Valide la signature d'un webhook kkiapay
        
        Args:
            payload: Données du webhook
            signature: Signature reçue dans les headers
            
        Returns:
            True si la signature est valide, False sinon
        """
        # TODO: Implémenter la validation de signature selon la doc kkiapay
        # Pour l'instant, on retourne True en mode sandbox
        if self.config.SANDBOX:
            return True
        
        # En production, valider avec le secret
        import hmac
        import hashlib
        import json
        
        payload_string = json.dumps(payload, separators=(',', ':'))
        expected_signature = hmac.HMAC(
            self.config.SECRET.encode(),
            payload_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, signature)
    
    async def get_transaction_status(self, transaction_id: str) -> str:
        """
        Récupère uniquement le statut d'une transaction
        
        Args:
            transaction_id: ID de la transaction
            
        Returns:
            Statut de la transaction ("SUCCESS", "FAILED", "PENDING", etc.)
        """
        try:
            transaction = await self.verify_transaction(transaction_id)
            return transaction.get("status", "UNKNOWN")
        except Exception as e:
            print(f"Erreur lors de la vérification de la transaction {transaction_id}: {str(e)}")
            return "ERROR"
