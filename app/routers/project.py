from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user
from app.utils.logger import create_log

router = APIRouter(prefix="/project", tags=["Project"])


@router.post("/", response_model=schemas.ProjectOut)  # ✅ FIX
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_project = models.Project(
        **project.dict(),
        owner_id=current_user.id
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    create_log(db, current_user.id, "CREATE_PROJECT")

    return new_project
