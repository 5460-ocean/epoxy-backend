from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base

class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    action = Column(String)
    project_id = Column(Integer, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
