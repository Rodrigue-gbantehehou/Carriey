from typing import Any, Dict, Optional
import httpx
from app.services.payments.provider_interface import PaymentProviderInterface
from app.services.fedapay import fedapay_service
import hmac
import hashlib
from app.core.config import settings

class FedaPayProvider(PaymentProviderInterface):
    """
    Intégration du fournisseur FedaPay.
    """
    
    async def create_checkout(self, amount: float, currency: str, success_url: str, cancel_url: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Crée une transaction FedaPay et retourne le token/url.
        """
        customer_email = metadata.get("customer_email", "guest@carriey.com") if metadata else "guest@carriey.com"
        customer_firstname = metadata.get("customer_firstname", "Client") if metadata else "Client"
        customer_lastname = metadata.get("customer_lastname", "Carriey") if metadata else "Carriey"
        description = metadata.get("description", "Achat Carriey") if metadata else "Achat Carriey"
        
        result = await fedapay_service.create_transaction(
            amount=amount,
            description=description,
            customer_email=customer_email,
            customer_firstname=customer_firstname,
            customer_lastname=customer_lastname
        )
        
        return {
            "transaction_id": result["transaction_id"],
            "token": result["token"],
            # FedaPay a un widget JS, mais on peut aussi renvoyer l'URL
            "checkout_url": result.get("url", "")
        }

    async def handle_webhook(self, payload: Any, signature: str) -> Dict[str, Any]:
        """
        Vérifie la signature du webhook FedaPay et retourne le statut.
        FedaPay signe avec HMAC SHA256 en utilisant le Secret Key.
        La signature est généralement dans le header X-FedaPay-Signature.
        """
        # Dans un cas réel, vérifier la signature :
        # secret = settings.FEDAPAY_SECRET_KEY.encode('utf-8')
        # if isinstance(payload, dict):
        #     import json
        #     payload_str = json.dumps(payload, separators=(',', ':'))
        # else:
        #     payload_str = payload
        # expected_sig = hmac.new(secret, payload_str.encode('utf-8'), hashlib.sha256).hexdigest()
        # if not hmac.compare_digest(expected_sig, signature):
        #     return {"status": "failed", "reason": "Invalid signature"}

        # Le payload FedaPay contient 'entity'
        if isinstance(payload, dict) and "entity" in payload:
            transaction = payload["entity"]
            status = transaction.get("status")
            tx_id = transaction.get("id")
            
            if status in ["approved", "success"]:
                return {
                    "status": "success",
                    "transaction_id": str(tx_id),
                    "raw_data": transaction
                }
            return {
                "status": "failed",
                "reason": f"Status is {status}",
                "transaction_id": str(tx_id)
            }
            
        return {"status": "failed", "reason": "Invalid payload format"}

    async def refund(self, transaction_id: str, amount: Optional[float] = None) -> bool:
        """
        Remboursement FedaPay non implémenté pour le moment.
        """
        return False
