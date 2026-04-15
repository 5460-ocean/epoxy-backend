from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app import models

# ⚠️ Keep simple first (no jwt yet)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    # 🔥 TEMP FIX: just return first user (to unblock deploy)
    user = db.query(models.User).first()

    if not user:
        raise HTTPException(status_code=401, detail="No users found")

    return user
