"""
Service de configuration pour kkiapay
"""
import os
from dotenv import load_dotenv

load_dotenv()

class KkiapayConfig:
    """Configuration centralisée pour kkiapay"""
    
    def __init__(self):
        self.PUBLIC_KEY = os.getenv("KKIAPAY_PUBLIC_KEY", "")
        self.PRIVATE_KEY = os.getenv("KKIAPAY_PRIVATE_KEY", "")
        self.SECRET = os.getenv("KKIAPAY_SECRET", "")
        self.SANDBOX = os.getenv("KKIAPAY_SANDBOX", "true").lower() == "true"
    
    def is_configured(self) -> bool:
        """Vérifie si kkiapay est correctement configuré"""
        return bool(self.PUBLIC_KEY and self.PRIVATE_KEY and self.SECRET)
    
    def get_config_dict(self) -> dict:
        """Retourne la configuration sous forme de dictionnaire"""
        return {
            "public_key": self.PUBLIC_KEY,
            "private_key": self.PRIVATE_KEY,
            "secret": self.SECRET,
            "sandbox": self.SANDBOX
        }
