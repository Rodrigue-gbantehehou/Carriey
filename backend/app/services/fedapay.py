import httpx
from typing import Dict, Any, Optional
from decimal import Decimal
from app.core.config import settings

class FedaPayService:
    """Service pour intégrer FedaPay"""
    
    def __init__(self):
        self.public_key = settings.FEDAPAY_PUBLIC_KEY
        self.secret_key = settings.FEDAPAY_SECRET_KEY
        self.sandbox = settings.FEDAPAY_SANDBOX
        
        if self.sandbox:
            self.api_url = "https://sandbox-api.fedapay.com/v1"
        else:
            self.api_url = "https://api.fedapay.com/v1"

    async def create_transaction(
        self, 
        amount: Decimal, 
        description: str,
        customer_email: str,
        customer_firstname: str = "Client",
        customer_lastname: str = __import__('os').getenv("APP_NAME", "Carriey")
    ) -> Dict[str, Any]:
        """
        Crée une transaction FedaPay
        """
        async with httpx.AsyncClient() as client:
            headers = {
                "Authorization": f"Bearer {self.secret_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "amount": int(amount),
                "currency": {"iso": "XOF"},
                "description": description,
                "customer": {
                    "firstname": customer_firstname,
                    "lastname": customer_lastname,
                    "email": customer_email
                }
            }
            
            response = await client.post(
                f"{self.api_url}/transactions",
                headers=headers,
                json=payload,
                timeout=30.0
            )
            
            response.raise_for_status()
            data = response.json()
            
            # Générer un token de paiement pour le widget si besoin
            transaction_id = data["v1/transaction"]["id"]
            
            return {
                "transaction_id": transaction_id,
                "status": data["v1/transaction"]["status"],
                "data": data["v1/transaction"]
            }

    async def verify_transaction(self, transaction_id: str) -> Dict[str, Any]:
        """
        Vérifie le statut d'une transaction FedaPay
        """
        async with httpx.AsyncClient() as client:
            headers = {
                "Authorization": f"Bearer {self.secret_key}",
                "Content-Type": "application/json"
            }
            
            response = await client.get(
                f"{self.api_url}/transactions/{transaction_id}",
                headers=headers,
                timeout=30.0
            )
            
            response.raise_for_status()
            return response.json()

# Instance globale
fedapay_service = FedaPayService()
