from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.dependencies.admin import get_admin_user   # ✅ FIX

router = APIRouter(prefix="/admin", tags=["admin"])


# ✅ GET PROJECTS
@router.get("/projects")
def get_projects(
    db: Session = Depends(get_db),
    current_user = Depends(get_admin_user)   # 🔥 FIX HERE
):
    projects = db.query(models.Project).all()

    result = []
    for p in projects:
        user = db.query(models.User).filter(models.User.id == p.owner_id).first()

        result.append({
            "id": p.id,
            "name": p.name,
            "status": "deleted" if p.is_deleted else "active",
            "creator": user.email if user else None
        })

    return result


# ✅ GET USERS
@router.get("/users")
def get_users(
    db: Session = Depends(get_db),
    current_user = Depends(get_admin_user)
):
    users = db.query(models.User).all()

    return [
        {
            "id": u.id,
            "email": u.email,
            "role": u.role
        }
        for u in users
    ]


# ❌ DELETE USER
@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user = Depends(get_admin_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_deleted = True
    db.commit()

    return {"message": "User deleted"}


# ♻️ RESTORE USER
@router.put("/users/restore/{user_id}")
def restore_user(user_id: int, db: Session = Depends(get_db), current_user = Depends(get_admin_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_deleted = False
    db.commit()

    return {"message": "User restored"}


# ❌ DELETE PROJECT
@router.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), current_user = Depends(get_admin_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.is_deleted = True
    db.commit()

    return {"message": "Project deleted"}


# ♻️ RESTORE PROJECT
@router.put("/projects/restore/{project_id}")
def restore_project(project_id: int, db: Session = Depends(get_db), current_user = Depends(get_admin_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.is_deleted = False
    db.commit()

    return {"message": "Project restored"}


# 📊 LOGS
@router.get("/logs")
def get_logs(db: Session = Depends(get_db), current_user = Depends(get_admin_user)):
    logs = db.query(models.Log).all()

    return [
        {
            "id": log.id,
            "action": log.action,
            "user_id": log.user_id,
            "timestamp": log.timestamp
        }
        for log in logs
    ]
