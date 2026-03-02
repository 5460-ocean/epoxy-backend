from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/wizard", tags=["Projects"])


@router.post(
    "/",
    response_model=schemas.ProjectOut,
    status_code=status.HTTP_201_CREATED
)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    new_project = models.Project(
        name=project.name,
        description=project.description,
        owner_id=current_user.id,
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project


@router.get("/", response_model=List[schemas.ProjectOut])
def get_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    projects = db.query(models.Project).filter(
        models.Project.owner_id == current_user.id
    ).all()
    return projects
