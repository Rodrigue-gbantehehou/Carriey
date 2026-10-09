from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from app.db.session import get_db
from app.models.contact import ContactMessage
from app.schemas.contact import ContactMessageCreate

router = APIRouter()

# Simple in-memory rate limiter for anti-spam
# In production, use Redis or a proper rate limiting library
rate_limit_cache = {}

@router.post("", status_code=status.HTTP_201_CREATED)
async def submit_contact_form(
    contact_in: ContactMessageCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Submit a contact form message.
    """
    # 1. Honeypot check
    if contact_in.honeypot:
        # If honeypot is filled, it's a bot. Silently return success to fool it.
        return {"status": "success", "message": "Message envoyé avec succès !"}

    # 2. Rate limiting by IP
    client_ip = request.client.host if request.client else "unknown"
    now = datetime.now(timezone.utc)
    
    if client_ip in rate_limit_cache:
        last_request_time = rate_limit_cache[client_ip]
        # Max 1 request every 2 minutes
        if now - last_request_time < timedelta(minutes=2):
            raise HTTPException(status_code=429, detail="Trop de requêtes. Veuillez patienter avant d'envoyer un autre message.")
    
    rate_limit_cache[client_ip] = now
    
    # Clean up old IPs from cache periodically (naïve approach for this simple cache)
    if len(rate_limit_cache) > 1000:
        keys_to_delete = [ip for ip, t in rate_limit_cache.items() if now - t > timedelta(hours=1)]
        for k in keys_to_delete:
            del rate_limit_cache[k]

    # 3. Store message in database
    new_message = ContactMessage(
        name=contact_in.name,
        email=contact_in.email,
        subject=contact_in.subject,
        message=contact_in.message,
        ip_address=client_ip,
        user_agent=request.headers.get("user-agent", "")[:255]
    )
    
    db.add(new_message)
    db.commit()
    
    # Note: In a real app, you would also dispatch a background task to send an email notification here
    
    return {"status": "success", "message": "Message envoyé avec succès !"}
