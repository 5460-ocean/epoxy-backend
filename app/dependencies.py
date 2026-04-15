from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app import models

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    # 🔥 token is user_id (simple version)
    user = db.query(models.User).filter(models.User.id == int(token)).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid user")

    return user
