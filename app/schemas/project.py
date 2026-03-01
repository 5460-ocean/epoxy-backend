from pydantic import BaseModel
from typing import Optional

class ProjectBase(BaseModel):
    name: str

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None

class ProjectOut(ProjectBase):
    id: int

    class Config:
        from_attributes = True
