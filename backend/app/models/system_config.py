from sqlalchemy import Column, String, Text
from app.db.session import Base

class SystemConfig(Base):
    __tablename__ = "system_configs"

    key = Column(String(100), primary_key=True, index=True)
    value = Column(Text, nullable=False)
    description = Column(String(255), nullable=True)

    def __repr__(self):
        return f"<SystemConfig {self.key}={self.value}>"
