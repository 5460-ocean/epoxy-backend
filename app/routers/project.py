from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/wizard",
    tags=["projects"]
)

# Create project
@router.post("/", response_model=schemas.ProjectOut)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    new_project = models.Project(
        name=project.name,
        user_id=user.id  # attach authenticated user
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

# Get all projects for the current user
@router.get("/", response_model=List[schemas.ProjectOut])
def get_projects(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    projects = db.query(models.Project).filter(models.Project.user_id == user.id).all()
    return projects

# Update a project
@router.put("/{project_id}", response_model=schemas.ProjectOut)
def update_project(
    project_id: int,
    project: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    db_project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.user_id == user.id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    db_project.name = project.name
    db.commit()
    db.refresh(db_project)
    return db_project

# Delete a project
@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    db_project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.user_id == user.id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(db_project)
    db.commit()
    return
