from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user


router = APIRouter(prefix="/wizard", tags=["projects"])


@router.post("/", response_model=schemas.ProjectOut)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    new_project = models.Project(
        name=project.name,
        description=project.description,
        user_id=user.id
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project


@router.get("/", response_model=List[schemas.ProjectOut])
def get_projects(
    skip: int = 0,
    limit: int = Query(default=10, lte=100),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    projects = (
        db.query(models.Project)
        .filter(models.Project.user_id == user.id)
        .order_by(models.Project.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return projects


@router.put("/{project_id}", response_model=schemas.ProjectOut)
def update_project(
    project_id: int,
    updated_data: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.name = updated_data.name
    project.description = updated_data.description

    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.user_id == user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()

    return {"message": "Project deleted successfully"}
