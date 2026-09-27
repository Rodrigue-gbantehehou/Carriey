from typing import Dict, Any
from app.services.payments.provider_interface import PaymentProviderInterface

class PaymentManager:
    """
    Gestionnaire central des paiements.
    Route les appels vers le bon provider selon la méthode choisie.
    """
    def __init__(self):
        self._providers: Dict[str, PaymentProviderInterface] = {}

    def register_provider(self, name: str, provider: PaymentProviderInterface):
        self._providers[name] = provider

    def get_provider(self, name: str) -> PaymentProviderInterface:
        provider = self._providers.get(name)
        if not provider:
            raise ValueError(f"Provider '{name}' non supporté ou non configuré.")
        return provider

# Instance globale (Singleton)
payment_manager = PaymentManager()

# Enregistrement des providers au démarrage
try:
    from app.services.payments.providers.kkiapay_provider import KkiapayProvider
    payment_manager.register_provider("kkiapay", KkiapayProvider())
except Exception as e:
    # Handle missing configuration or import errors gracefully
    print(f"Warning: Failed to load KkiapayProvider: {e}")
