import asyncio
import logging
import time
from pathlib import Path

logger = logging.getLogger("carriey.cleanup")

class CleanupService:
    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        self.private_exports_dir = self.base_dir / "private_exports"
        self.is_running = False
        self._task = None

    async def _purge_loop(self, retention_hours: int = 48, interval_seconds: int = 3600):
        """Boucle asynchrone purgeant les vieux fichiers d'export et les temporaires."""
        logger.info(f"[CleanupService] Démarrage du job de purge (Rétention: {retention_hours}h, Intervalle: {interval_seconds}s)")
        self.is_running = True
        while self.is_running:
            try:
                self.run_purge(retention_hours=retention_hours)
            except Exception as e:
                logger.error(f"[CleanupService] Erreur inattendue durant la purge : {e}")
            
            # Attendre avant la prochaine exécution
            await asyncio.sleep(interval_seconds)

    def run_purge(self, retention_hours: int = 48) -> dict:
        """Exécute une purge immédiate des fichiers obsolètes."""
        now = time.time()
        cutoff = now - (retention_hours * 3600)
        
        stats = {
            "deleted_exports": 0,
            "deleted_tmp_html": 0,
            "errors": 0
        }

        # 1. Nettoyer les fichiers dans private_exports/
        if self.private_exports_dir.exists():
            for file_path in self.private_exports_dir.glob("*"):
                if file_path.is_file() and file_path.stat().st_mtime < cutoff:
                    try:
                        file_path.unlink()
                        stats["deleted_exports"] += 1
                        logger.info(f"[CleanupService] Export supprimé: {file_path.name}")
                    except Exception as e:
                        stats["errors"] += 1
                        logger.error(f"[CleanupService] Erreur de suppression (export) {file_path.name}: {e}")

        # 2. Nettoyer les fichiers HTML temporaires générés à la racine
        for file_path in self.base_dir.glob("_tmp_render_*.html"):
            if file_path.is_file() and file_path.stat().st_mtime < cutoff:
                try:
                    file_path.unlink()
                    stats["deleted_tmp_html"] += 1
                    logger.info(f"[CleanupService] Fichier temporaire supprimé: {file_path.name}")
                except Exception as e:
                    stats["errors"] += 1
                    logger.error(f"[CleanupService] Erreur de suppression (tmp html) {file_path.name}: {e}")
                    
        if stats["deleted_exports"] > 0 or stats["deleted_tmp_html"] > 0 or stats["errors"] > 0:
            logger.info(f"[CleanupService] Purge terminée. Résultats: {stats}")
            
        return stats

    def start(self, retention_hours: int = 48, interval_seconds: int = 3600):
        """Lance la boucle de nettoyage en tâche de fond."""
        if not self._task or self._task.done():
            self._task = asyncio.create_task(self._purge_loop(retention_hours, interval_seconds))

    def stop(self):
        """Arrête la boucle de nettoyage."""
        self.is_running = False
        if self._task and not self._task.done():
            self._task.cancel()

# Instance globale (Singleton)
BASE_DIR = Path(__file__).resolve().parents[2]
cleanup_service = CleanupService(base_dir=BASE_DIR)
