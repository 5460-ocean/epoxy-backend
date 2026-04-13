from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.deps import require_admin

router = APIRouter(prefix="/admin", tags=["admin"])


# 🔍 VIEW USERS
@router.get("/users")
def get_users(db: Session = Depends(get_db), user=Depends(require_admin)):
    users = db.query(models.User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "role": u.role,
            "status": "deleted" if u.is_deleted else "active"
        }
        for u in users
    ]


# ❌ DELETE USER
@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), user=Depends(require_admin)):
    u = db.query(models.User).filter(models.User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")

    u.is_deleted = True
    db.commit()
    return {"message": "User deleted"}


# ♻️ RESTORE USER
@router.put("/users/restore/{user_id}")
def restore_user(user_id: int, db: Session = Depends(get_db), user=Depends(require_admin)):
    u = db.query(models.User).filter(models.User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")

    u.is_deleted = False
    db.commit()
    return {"message": "User restored"}


# 🔍 VIEW PROJECTS
@router.get("/projects")
def get_projects(db: Session = Depends(get_db), user=Depends(require_admin)):
    projects = db.query(models.Project).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "status": "deleted" if p.is_deleted else "active"
        }
        for p in projects
    ]


# ❌ DELETE PROJECT
@router.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), user=Depends(require_admin)):
    p = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    p.is_deleted = True
    db.commit()
    return {"message": "Project deleted"}


# ♻️ RESTORE PROJECT
@router.put("/projects/restore/{project_id}")
def restore_project(project_id: int, db: Session = Depends(get_db), user=Depends(require_admin)):
    p = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    p.is_deleted = False
    db.commit()
    return {"message": "Project restored"}


# 📜 LOGS
@router.get("/logs")
def get_logs(user=Depends(require_admin)):
    return {
        "logs": [
            "System started",
            "Admin accessed logs"
        ]
    }
