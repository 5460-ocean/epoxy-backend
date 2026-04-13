from sqlalchemy import Column, Integer, String
from app.database import Base

class Theme(Base):
    __tablename__ = "themes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
