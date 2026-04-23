from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Auth"])

# ✅ Request schema
class UserCreate(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(user: UserCreate):
    return {
        "message": "user registered",
        "email": user.email
    }

@router.post("/login")
def login(user: UserCreate):
    return {
        "message": "login successful",
        "email": user.email
    }
