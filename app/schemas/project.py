from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    surface: Optional[str] = None
    theme: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    surface: Optional[str] = None
    theme: Optional[str] = None


class ProjectOut(ProjectBase):
    id: int
    owner_id: int
    is_deleted: bool
    created_at: datetime

    class Config:
        from_attributes = True   # ✅ IMPORTANT (Pydantic v2)
