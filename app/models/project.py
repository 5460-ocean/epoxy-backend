from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    surface = Column(String)
    theme = Column(String)
    deleted = Column(Boolean, default=False)
