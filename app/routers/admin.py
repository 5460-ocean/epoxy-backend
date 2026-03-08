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

from sqlalchemy.orm import Session
from fastapi import Depends
from app.database import get_db
from app.models.activity_log import ActivityLog
from app.dependencies import get_current_admin


@router.get("/logs")
def get_activity_logs(
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    logs = db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).all()
    return logs

