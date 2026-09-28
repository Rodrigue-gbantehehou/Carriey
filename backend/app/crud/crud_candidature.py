from sqlalchemy.orm import Session
from app.models.candidature import Candidature
from app.schemas.candidature import CandidatureCreate, CandidatureUpdate
from app.crud.base import CRUDBase

class CRUDCandidature(CRUDBase[Candidature, CandidatureCreate, CandidatureUpdate]):
    def get_by_user(self, db: Session, user_id: str):
        return db.query(self.model).filter(self.model.user_id == user_id).all()
        
    def create_with_user(self, db: Session, *, obj_in: CandidatureCreate, user_id: str) -> Candidature:
        db_obj = self.model(**obj_in.dict(), user_id=user_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
        
candidature = CRUDCandidature(Candidature)
