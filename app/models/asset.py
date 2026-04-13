from sqlalchemy import Column, Integer, String
from app.database import Base

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    category = Column(String)
