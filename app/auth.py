from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from jose import jwt

SECRET_KEY = "secret"
ALGORITHM = "HS256"

router = APIRouter(prefix="/auth", tags=["Auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# ===== SCHEMA =====
class UserCreate(BaseModel):
    email: str
    password: str

# ===== TOKEN =====
def create_token(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

# ===== REGISTER (RESTORED) =====
@router.post("/register")
def register(user: UserCreate):
    return {
        "message": "user registered",
        "email": user.email
    }

# ===== LOGIN (DUAL MODE) =====
@router.post("/login")
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends()
):
    try:
        email = form_data.username
        password = form_data.password
    except:
        body = await request.json()
        email = body.get("email")
        password = body.get("password")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Missing credentials")

    token = create_token({"sub": email})

    return {
        "access_token": token,
        "token_type": "bearer"
    }

# ===== PROTECTED =====
@router.get("/me")
def get_me(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"user": payload["sub"]}
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
