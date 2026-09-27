import hmac
import hashlib
import httpx
from typing import Dict, Any, Optional
from decimal import Decimal
from app.core.config import settings

class KkiaPayService:
    """Service pour intégrer KkiaPay"""
    
    def __init__(self):
        self.public_key = settings.KKIAPAY_PUBLIC_KEY
        self.private_key = settings.KKIAPAY_PRIVATE_KEY
        self.secret = settings.KKIAPAY_SECRET
        self.api_url = "https://api.kkiapay.me/api/v1"
        self.sandbox = settings.KKIAPAY_SANDBOX
        
        # KkiaPay utilise généralement la même URL, la distinction se fait via les clés (pk_live vs pk_test)
        # Mais si une URL sandbox spécifique existe, elle peut être surchargée via env

    
    async def create_payment(
        self, 
        amount: Decimal, 
        reason: str,
        callback_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Crée une transaction KkiaPay
        
        Args:
            amount: Montant en XOF
            reason: Description du paiement
            callback_url: URL de callback après paiement
            
        Returns:
            Dict avec transaction_id et payment_url
        """
        async with httpx.AsyncClient() as client:
            headers = {
                "x-api-key": self.public_key,
                "Content-Type": "application/json"
            }
            
            payload = {
                "amount": int(amount),
                "reason": reason,
                "sandbox": self.sandbox
            }
            
            if callback_url:
                payload["callback"] = callback_url
            
            response = await client.post(
                f"{self.api_url}/transactions",
                headers=headers,
                json=payload,
                timeout=30.0
            )
            
            response.raise_for_status()
            data = response.json()
            
            return {
                "transaction_id": data.get("transactionId"),
                "payment_url": data.get("url"),
                "status": data.get("status", "pending")
            }
    
    async def verify_transaction(self, transaction_id: str) -> Dict[str, Any]:
        """
        Vérifie le statut d'une transaction
        
        Args:
            transaction_id: ID de la transaction KkiaPay
            
        Returns:
            Dict avec les détails de la transaction
        """
        async with httpx.AsyncClient() as client:
            headers = {
                "x-private-key": self.private_key,
                "Content-Type": "application/json"
            }
            
            response = await client.get(
                f"{self.api_url}/transactions/{transaction_id}",
                headers=headers,
                timeout=30.0
            )
            
            response.raise_for_status()
            return response.json()
    
    def verify_webhook_signature(
        self, 
        payload: str, 
        signature: str
    ) -> bool:
        """
        Vérifie la signature du webhook KkiaPay
        
        Args:
            payload: Corps de la requête webhook (string)
            signature: Signature fournie dans le header
            
        Returns:
            True si la signature est valide
        """
        if not self.secret:
            return False
        
        expected_signature = hmac.HMAC(
            self.secret.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, signature)
    
    async def refund_transaction(self, transaction_id: str) -> Dict[str, Any]:
        """
        Rembourse une transaction
        
        Args:
            transaction_id: ID de la transaction à rembourser
            
        Returns:
            Dict avec le statut du remboursement
        """
        async with httpx.AsyncClient() as client:
            headers = {
                "x-api-key": self.private_key,
                "Content-Type": "application/json"
            }
            
            response = await client.post(
                f"{self.api_url}/transactions/{transaction_id}/refund",
                headers=headers,
                timeout=30.0
            )
            
            response.raise_for_status()
            return response.json()

# Instance globale
kkiapay_service = KkiaPayService()
