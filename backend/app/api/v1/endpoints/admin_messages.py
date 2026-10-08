from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional

from app.db.session import get_db
from app.models.contact import ContactMessage
from app.schemas.contact import ContactMessageOut
from app.api.deps import get_current_active_admin

router = APIRouter()

@router.get("/", response_model=List[ContactMessageOut])
def get_contact_messages(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_active_admin)
):
    """
    Get all contact messages (Admin only).
    """
    messages = db.query(ContactMessage).order_by(desc(ContactMessage.created_at)).offset(skip).limit(limit).all()
    return messages

@router.delete("/{message_id}")
def delete_contact_message(
    message_id: str,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_active_admin)
):
    """
    Delete a contact message.
    """
    msg = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message introuvable")
    
    db.delete(msg)
    db.commit()
    return {"status": "success"}
