"""
Configuration du système de logging centralisé (style Symfony)
Écrit dans : backend/static/logs/carriey.log
"""
import logging
import logging.handlers
import os
from pathlib import Path

# ─── Répertoire des logs ──────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parents[2]  # backend/
LOG_DIR = BASE_DIR / "static" / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

LOG_FILE = LOG_DIR / "carriey.log"

# ─── Format (style Symfony) ───────────────────────────────────────────────────
LOG_FORMAT = "[%(asctime)s] %(levelname)-8s %(name)s: %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

# ─── Handler : fichier rotatif (max 5 Mo, 10 fichiers) ───────────────────────
_file_handler = logging.handlers.RotatingFileHandler(
    LOG_FILE,
    maxBytes=5 * 1024 * 1024,  # 5 Mo
    backupCount=10,
    encoding="utf-8",
)
_file_handler.setFormatter(logging.Formatter(LOG_FORMAT, DATE_FORMAT))
_file_handler.setLevel(logging.DEBUG)

# ─── Handler : console (stderr → Passenger voit les logs aussi) ──────────────
_console_handler = logging.StreamHandler()
_console_handler.setFormatter(logging.Formatter(LOG_FORMAT, DATE_FORMAT))
_console_handler.setLevel(logging.INFO)


def setup_logging(level: int = logging.DEBUG) -> None:
    """
    Configure le logging global de l'application.
    À appeler une seule fois au démarrage dans main.py.
    """
    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Eviter les handlers dupliqués
    if not any(isinstance(h, logging.handlers.RotatingFileHandler)
               for h in root_logger.handlers):
        root_logger.addHandler(_file_handler)

    if not any(isinstance(h, logging.StreamHandler) and
               not isinstance(h, logging.handlers.RotatingFileHandler)
               for h in root_logger.handlers):
        root_logger.addHandler(_console_handler)

    # Réduire le bruit des libs tierces
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.INFO)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("passlib").setLevel(logging.WARNING)

    root_logger.info("=" * 60)
    root_logger.info(f"🚀 Carriey Backend — Logs initialisés : {LOG_FILE}")
    root_logger.info("=" * 60)


def get_logger(name: str) -> logging.Logger:
    """Retourne un logger nommé (à utiliser dans chaque module)."""
    return logging.getLogger(name)
