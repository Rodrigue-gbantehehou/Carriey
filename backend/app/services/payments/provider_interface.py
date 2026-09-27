from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

class PaymentProviderInterface(ABC):
    """
    Interface abstraite pour tous les fournisseurs de paiement.
    Garantit que chaque fournisseur implémente les mêmes méthodes.
    """
    
    @abstractmethod
    async def create_checkout(self, amount: float, currency: str, success_url: str, cancel_url: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Crée une session de paiement.
        Doit retourner un dictionnaire contenant au minimum 'checkout_url' et 'transaction_id'.
        """
        pass

    @abstractmethod
    async def handle_webhook(self, payload: Any, signature: str) -> Dict[str, Any]:
        """
        Traite le webhook envoyé par le fournisseur.
        Doit retourner un statut standardisé (success, failed, etc.) et les métadonnées.
        """
        pass

    @abstractmethod
    async def refund(self, transaction_id: str, amount: Optional[float] = None) -> bool:
        """
        Rembourse une transaction.
        """
        pass
