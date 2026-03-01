from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas.project import ProjectCreate
from app.dependencies import get_current_user

router = APIRouter(prefix="/wizard", tags=["projects"])

@router.post("/")
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    print("TYPE project.name:", type(project.name))
    print("TYPE current_user.id:", type(current_user.id))
    print("VALUE current_user.id:", current_user.id)

    new_project = models.Project(
        name=project.name,
        user_id=current_user.id
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project
