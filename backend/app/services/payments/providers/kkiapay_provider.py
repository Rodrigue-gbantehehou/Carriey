from typing import Any, Dict, Optional
from app.services.payments.provider_interface import PaymentProviderInterface
from app.services.kkiapay import KkiaPayService
from decimal import Decimal

class KkiapayProvider(PaymentProviderInterface):
    """
    Implémentation de l'interface Provider pour Kkiapay.
    Agit comme un Adapteur (Wrapper) autour du service KkiaPayService existant.
    """
    
    def __init__(self):
        self.kkiapay_service = KkiaPayService()

    async def create_checkout(self, amount: float, currency: str, success_url: str, cancel_url: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Crée une intention de paiement Kkiapay.
        Kkiapay n'utilise pas de lien généré par l'API Backend pour le paiement standard,
        mais plutôt un widget Frontend. Nous renvoyons donc la configuration.
        """
        transaction_ref = metadata.get("internal_ref") if metadata else f"tx_{amount}"
        
        return {
            "checkout_url": "", # Sera géré par le widget côté client
            "transaction_id": transaction_ref,
            "provider_config": {
                "public_key": self.kkiapay_service.public_key,
                "amount": int(amount),
                "sandbox": self.kkiapay_service.sandbox,
                "theme": "#4f46e5",
                "callback": success_url
            }
        }

    async def handle_webhook(self, payload: Any, signature: str = "") -> Dict[str, Any]:
        """
        Vérifie et gère le retour du paiement.
        """
        transaction_id = payload.get("transaction_id") if isinstance(payload, dict) else payload
        
        if not transaction_id:
            return {"status": "failed", "error": "Transaction ID manquant"}

        # Vérification via le service existant
        try:
            verification = await self.kkiapay_service.verify_transaction(transaction_id)
            if verification.get("status") == "SUCCESS":
                return {
                    "status": "success",
                    "transaction_id": transaction_id,
                    "metadata": verification
                }
        except Exception as e:
            return {"status": "error", "error": str(e)}

        return {"status": "failed"}

    async def refund(self, transaction_id: str, amount: Optional[float] = None) -> bool:
        # Implémentation du remboursement si supporté par Kkiapay
        return False
