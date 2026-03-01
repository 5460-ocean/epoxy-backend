from pydantic import BaseModel, EmailStr

# Schema for creating a user
class UserCreate(BaseModel):
    email: EmailStr
    password: str

# Schema for returning user info
class UserOut(BaseModel):
    id: int
    email: EmailStr

    class Config:
        orm_mode = True
