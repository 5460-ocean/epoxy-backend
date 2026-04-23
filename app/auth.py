from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer
from jose import jwt

SECRET_KEY = "secret"
ALGORITHM = "HS256"

router = APIRouter(prefix="/auth", tags=["Auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

class UserCreate(BaseModel):
    email: str
    password: str

def create_token(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/register")
def register(user: UserCreate):
    return {"message": "user registered"}

@router.post("/login")
def login(user: UserCreate):
    token = create_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

# 🔐 PROTECTED EXAMPLE
@router.get("/me")
def get_me(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"user": payload["sub"]}
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
