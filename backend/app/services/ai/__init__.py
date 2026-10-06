"""
Package AI de Carriey
Importe le service centralisé et la factory pour un accès simple.

Usage dans les endpoints :
    from app.services.ai import get_ai_service
    service = get_ai_service()
    result = await service.generate_cover_letter(...)
"""

from app.services.ai.factory import get_ai_service
from app.services.ai.service import AIService

__all__ = ["get_ai_service", "AIService"]
