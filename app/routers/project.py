from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user
from app.utils.logger import create_log

router = APIRouter(prefix="/project", tags=["Project"])


# ✅ GET PROJECTS
@router.get("/")
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

    items = []
    for p in projects:
        items.append({
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "surface": p.surface,
            "theme": p.theme,
            "owner_id": p.owner_id,
            "is_deleted": p.is_deleted,
            "created_at": str(p.created_at)
        })

    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit
    }


# ✅ CREATE PROJECT
@router.post("/")
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

    return {
        "id": new_project.id,
        "name": new_project.name,
        "description": new_project.description,
        "surface": new_project.surface,
        "theme": new_project.theme,
        "owner_id": new_project.owner_id,
        "is_deleted": new_project.is_deleted,
        "created_at": str(new_project.created_at)
    }


# ✅ UPDATE PROJECT (FIXED)
@router.put("/{project_id}")
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

    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "surface": project.surface,
        "theme": project.theme,
        "owner_id": project.owner_id,
        "is_deleted": project.is_deleted,
        "created_at": str(project.created_at)
    }


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
