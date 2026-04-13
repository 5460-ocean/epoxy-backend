from pydantic import BaseModel
from datetime import datetime

class LogOut(BaseModel):
    id: int
    user_id: int
    action: str
    project_id: int | None = None
    timestamp: datetime

    class Config:
        from_attributes = True
