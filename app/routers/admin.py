from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.dependencies import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])


# ✅ Admin Projects (IMPROVED)
@router.get("/projects")
def get_projects(db: Session = Depends(get_db), current_user=Depends(get_current_user)):

    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    projects = db.query(models.Project).all()

    result = []
    for p in projects:
        owner = db.query(models.User).filter(models.User.id == p.owner_id).first()

        result.append({
            "id": p.id,
            "name": p.name,
            "status": "deleted" if p.is_deleted else "active",
            "owner": owner.email if owner else None   # ✅ NEW
        })

    return result

@router.get("/users")
def get_users(db: Session = Depends(get_db), current_user=Depends(get_current_user)):

    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    users = db.query(models.User).all()

    return [
        {
            "id": u.id,
            "email": u.email,
            "role": u.role
        }
        for u in users
    ]
