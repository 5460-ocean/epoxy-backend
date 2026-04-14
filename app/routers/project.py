from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user
from app.utils.logger import create_log

router = APIRouter(prefix="/project", tags=["Project"])


# ✅ GET PROJECTS
@router.get("/", response_model=dict)
def get_projects(
    skip: int = 0,
    limit: int = 10,
    search: str = Query(None),
    name: str = Query(None),
    surface: str = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(models.Project).filter(
        models.Project.owner_id == current_user.id,
        models.Project.is_deleted == False
    )

    if search:
        query = query.filter(
            or_(
                models.Project.name.ilike(f"%{search}%"),
                models.Project.description.ilike(f"%{search}%")
            )
        )

    if name:
        query = query.filter(models.Project.name.ilike(f"%{name}%"))

    if surface:
        query = query.filter(models.Project.surface.ilike(f"%{surface}%"))

    total = query.count()
    projects = query.offset(skip).limit(limit).all()

    return {
        "items": projects,
        "total": total,
        "skip": skip,
        "limit": limit
    }


# ✅ CREATE PROJECT (FIXED RESPONSE)
@router.post("/", response_model=schemas.ProjectOut)
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


# ✅ UPDATE PROJECT
@router.put("/{project_id}", response_model=schemas.ProjectOut)
def update_project(
    project_id: int,
    updated: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    for key, value in updated.dict(exclude_unset=True).items():
        setattr(project, key, value)

    db.commit()
    db.refresh(project)

    create_log(db, current_user.id, "UPDATE_PROJECT")

    return project


# ❌ DELETE PROJECT
@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.is_deleted = True
    db.commit()

    create_log(db, current_user.id, "DELETE_PROJECT")

    return {"message": "Project deleted"}


# ♻️ RESTORE PROJECT
@router.put("/restore/{project_id}")
def restore_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.is_deleted = False
    db.commit()

    create_log(db, current_user.id, "RESTORE_PROJECT")

    return {"message": "Project restored"}
