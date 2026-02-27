from pydantic import BaseModel
from datetime import datetime


class ProjectCreate(BaseModel):
    name: str
    user_id: int


class ProjectResponse(BaseModel):
    id: int
    name: str
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True
