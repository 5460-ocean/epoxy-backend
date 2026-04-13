from sqlalchemy import Column, Integer, String
from app.database import Base

class Surface(Base):
    __tablename__ = "surfaces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
