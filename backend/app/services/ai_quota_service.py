from datetime import datetime, timezone
import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user import User
from app.models.ai_log import AILog

logger = logging.getLogger(__name__)

# Quotas par défaut
FREE_QUOTA_PER_DAY = 5
PRO_QUOTA_PER_DAY = 50

def check_and_consume_ai_quota(db: Session, user: User, cost: int = 1):
    """
    Vérifie si l'utilisateur a suffisamment de quota IA pour l'action.
    Si oui, incrémente sa consommation et sauvegarde en base.
    Si non, lève une HTTPException (429 Too Many Requests).
    """
    now = datetime.now(timezone.utc)
    today = now.date()
    
    # 1. Reset du quota si on est un nouveau jour
    if user.last_ai_usage_date is None or user.last_ai_usage_date.date() != today:
        user.ai_quota_used_today = 0
        user.last_ai_usage_date = now

    # 2. Déterminer la limite
    is_pro = user.premium_until and user.premium_until.replace(tzinfo=timezone.utc) > now
    quota_limit = PRO_QUOTA_PER_DAY if is_pro else FREE_QUOTA_PER_DAY

    # 3. Vérifier le dépassement
    if user.ai_quota_used_today + cost > quota_limit:
        logger.warning(
            f"Quota IA dépassé pour user {user.id} ({user.email}). "
            f"Utilisé: {user.ai_quota_used_today}/{quota_limit} (PRO: {is_pro})"
        )
        raise HTTPException(
            status_code=429, 
            detail=f"Vous avez atteint votre limite d'utilisation de l'IA pour aujourd'hui ({quota_limit} requêtes/jour). "
                   f"{'Réessayez demain.' if is_pro else 'Passez au plan PRO pour augmenter votre limite.'}"
        )

    # 4. Consommer le quota
    user.ai_quota_used_today += cost
    user.last_ai_usage_date = now
    db.commit()
    
    logger.info(
        f"Consommation IA pour user {user.id} ({user.email}): "
        f"{user.ai_quota_used_today}/{quota_limit} (PRO: {is_pro})"
    )
    return True

def log_ai_usage(db: Session, user: User, operation: str, metadata: dict):
    """
    Enregistre l'utilisation de l'IA (modèle, tokens, coût) dans la table ai_logs.
    """
    model_name = metadata.get("model", "unknown")
    prompt_tokens = metadata.get("prompt_tokens", 0)
    completion_tokens = metadata.get("completion_tokens", 0)
    
    cost_usd = 0.0
    if "gemini-2.0-flash" in model_name:
        cost_usd = (prompt_tokens / 1_000_000 * 0.15) + (completion_tokens / 1_000_000 * 0.60)
    elif "gpt-oss" in model_name or "groq" in model_name:
        cost_usd = (prompt_tokens / 1_000_000 * 0.0) + (completion_tokens / 1_000_000 * 0.0)  # Llama 3 etc on groq is very cheap
        
    ai_log = AILog(
        user_id=user.id,
        operation_type=operation,
        model_name=model_name,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        cost_usd=cost_usd
    )
    db.add(ai_log)
    db.commit()
