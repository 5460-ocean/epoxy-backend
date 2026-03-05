from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_admin
from app import models

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    users = db.query(models.User).all()
    return users


@router.get("/projects")
def get_all_projects(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    projects = db.query(models.Project).all()
    return projects
