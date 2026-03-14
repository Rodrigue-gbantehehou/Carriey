"""
Service de configuration pour kkiapay
"""
import os
from dotenv import load_dotenv

load_dotenv()

class KkiapayConfig:
    """Configuration centralisée pour kkiapay"""
    
    PUBLIC_KEY = os.getenv("KKIAPAY_PUBLIC_KEY", "")
    PRIVATE_KEY = os.getenv("KKIAPAY_PRIVATE_KEY", "")
    SECRET = os.getenv("KKIAPAY_SECRET", "")
    SANDBOX = os.getenv("KKIAPAY_SANDBOX", "true").lower() == "true"
    
    @classmethod
    def is_configured(cls) -> bool:
        """Vérifie si kkiapay est correctement configuré"""
        return bool(cls.PUBLIC_KEY and cls.PRIVATE_KEY and cls.SECRET)
    
    @classmethod
    def get_config_dict(cls) -> dict:
        """Retourne la configuration sous forme de dictionnaire"""
        return {
            "public_key": cls.PUBLIC_KEY,
            "private_key": cls.PRIVATE_KEY,
            "secret": cls.SECRET,
            "sandbox": cls.SANDBOX
        }
