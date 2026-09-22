from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import distinct

from app.db.session import get_db
from app.models.persona import Persona
from app.schemas.persona import PersonaOut, SectorOut

router = APIRouter(prefix="/personas", tags=["personas"])

@router.get("/sectors", response_model=List[str])
async def list_sectors(db: Session = Depends(get_db)):
    """Liste tous les domaines d'activité disponibles"""
    sectors = db.query(distinct(Persona.sector)).all()
    return [s[0] for s in sectors]

@router.get("/", response_model=List[PersonaOut])
async def list_personas(
    sector: Optional[str] = None, 
    experience: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Liste les personas filtrés par secteur et niveau d'expérience"""
    query = db.query(Persona)
    if sector:
        query = query.filter(Persona.sector == sector)
    if experience:
        query = query.filter(Persona.experience_level == experience)
    
    return query.all()

@router.get("/content", response_model=PersonaOut)
async def get_persona_content(
    sector: str,
    experience: str,
    db: Session = Depends(get_db)
):
    """Récupère le contenu spécifique d'un persona"""
    persona = db.query(Persona).filter(
        Persona.sector == sector,
        Persona.experience_level == experience
    ).first()
    
    if not persona:
        # Fallback to nearest experience level if exact match not found
        persona = db.query(Persona).filter(Persona.sector == sector).first()
        
    if not persona:
        raise HTTPException(status_code=404, detail="Aucun exemple trouvé pour ce domaine")
    
    return persona
