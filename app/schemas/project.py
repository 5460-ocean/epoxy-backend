from pydantic import BaseModel, ConfigDict
from typing import Optional


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ProjectOut(ProjectBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class ProjectPagination(BaseModel):
    total: int
    skip: int
    limit: int
    items: list[ProjectOut]

    model_config = ConfigDict(from_attributes=True)
class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

# Correct ProjectOut with owner_id
class ProjectOut(ProjectBase):
    id: int
    owner_id: int

    model_config = ConfigDict(from_attributes=True)

