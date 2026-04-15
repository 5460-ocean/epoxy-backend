from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models

# ✅ SAFE TEMP VERSION (no auth logic)
def get_current_user(db: Session = Depends(get_db)):
    return db.query(models.User).first()
