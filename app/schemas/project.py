from pydantic import BaseModel

# Project schemas
class ProjectCreate(BaseModel):
    name: str

class ProjectUpdate(BaseModel):
    name: str

class ProjectOut(BaseModel):
    id: int
    name: str
    user_id: int

    class Config:
        orm_mode = True
