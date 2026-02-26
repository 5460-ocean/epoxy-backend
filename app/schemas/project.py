from pydantic import BaseModel

class ProjectCreate(BaseModel):
    name: str
    user_id: int

class ProjectUpdate(BaseModel):
    name: str | None = None
    user_id: int | None = None
