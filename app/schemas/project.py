from pydantic import BaseModel
from datetime import datetime

class ProjectBase(BaseModel):
    name: str
    description: str
    surface: str
    theme: str

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    pass

class ProjectOut(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True

class ProjectList(BaseModel):
    items: list[ProjectOut]
    total: int
