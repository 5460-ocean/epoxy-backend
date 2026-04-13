from pydantic import BaseModel

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str   # ✅ ONLY password

class UserOut(UserBase):
    id: int
    role: str

    class Config:
        from_attributes = True
