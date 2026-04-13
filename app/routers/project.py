from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/project", tags=["Project"])


# ✅ GET projects (triggers Swagger OAuth)
@router.get("/", response_model=schemas.ProjectList)
def get_projects(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)  # 🔥 IMPORTANT
):
    projects = db.query(models.Project).all()

    return {
        "total": len(projects),
        "skip": 0,
        "limit": len(projects),
        "items": projects
    }


# ✅ CREATE project
@router.post("/", response_model=schemas.ProjectOut)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    new_project = models.Project(
        **project.dict(),
        owner_id=current_user.id
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project


# ✅ UPDATE project
@router.put("/{project_id}", response_model=schemas.ProjectOut)
def update_project(
    project_id: int,
    updated: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # 👇 permissions
    if project.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    for key, value in updated.dict().items():
        setattr(project, key, value)

    db.commit()
    db.refresh(project)

    return project


# ✅ DELETE project (soft delete)
@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    project.status = "deleted"
    db.commit()

    return {"message": "Project deleted"}
