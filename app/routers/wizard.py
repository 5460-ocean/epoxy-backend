from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectOut
from app.dependencies import get_current_user
from app.services.activity_logger import log_activity

router = APIRouter(prefix="/wizard", tags=["wizard"])

limiter = Limiter(key_func=get_remote_address)


@router.get("", response_model=List[ProjectOut])
def get_projects(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Project).filter(Project.owner_id == current_user.id).all()


@router.post("", response_model=ProjectOut)
@limiter.limit("10/minute")
def create_project(
    request: Request,
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    db_project = Project(**project.dict(), owner_id=current_user.id)

    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    log_activity(db, current_user.id, "create", "project", db_project.id)

    return db_project


@router.put("/{project_id}", response_model=ProjectOut)
@limiter.limit("20/minute")
def update_project(
    request: Request,
    project_id: int,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    for key, value in project_update.dict(exclude_unset=True).items():
        setattr(project, key, value)

    db.commit()
    db.refresh(project)

    log_activity(db, current_user.id, "update", "project", project.id)

    return project


@router.delete("/{project_id}")
@limiter.limit("10/minute")
def delete_project(
    request: Request,
    project_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()

    log_activity(db, current_user.id, "delete", "project", project_id)

    return {"message": "Project deleted"}

