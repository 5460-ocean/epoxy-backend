from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.database import get_db
from app import models, schemas
from app.auth import verify_password, hash_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        existing_user = db.query(models.User).filter(models.User.email == user.email).first()

        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        role = "admin" if user.email == "admin@test.com" else "user"

        new_user = models.User(
            email=user.email,
            hashed_password=hash_password(user.password),
            role=role
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {"message": f"{role} created successfully"}

    except Exception as e:
        return {"error": str(e)}  # 🔥 show real error
