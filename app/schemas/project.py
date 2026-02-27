from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str
    user_id: int


class ProjectResponse(BaseModel):
    id: int
    name: str
    user_id: int

    class Config:
        orm_mode = True
