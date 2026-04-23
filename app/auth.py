from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt

SECRET_KEY = "secret"
ALGORITHM = "HS256"

router = APIRouter(prefix="/auth", tags=["Auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def create_token(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/login")
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends()
):
    try:
        # ✅ Try OAuth2 form first
        email = form_data.username
        password = form_data.password
    except:
        # ✅ Fallback to JSON
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

@router.get("/me")
def get_me(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"user": payload["sub"]}
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
