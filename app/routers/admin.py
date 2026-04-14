from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.dependencies import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])


def check_admin(user):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")


@router.get("/projects")
def get_projects(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    check_admin(current_user)

    return {"message": "NEW CODE DEPLOYED"}  # 🔥 obvious change
