from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from pydantic import BaseModel

from app.database import SessionLocal
from app.models.project import Project

# ✅ FIX: router defined
router = APIRouter(prefix="/project", tags=["Project"])

# ===== DB SESSION =====
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ===== SCHEMA =====
class ProjectCreate(BaseModel):
    name: str
    description: str
    surface: str
    theme: str

# ===== GET PROJECTS (FIXED SEARCH) =====
@router.get("/")
def get_projects(
    skip: int = 0,
    limit: int = 5,
    search: Optional[str] = None,
    name: Optional[str] = None,
    surface: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Project).filter(Project.deleted == False)

    # 🔥 SMART SEARCH
    if search:
        words = search.split()

        conditions = []
        for word in words:
            conditions.append(Project.name.contains(word))
            conditions.append(Project.surface.contains(word))
            conditions.append(Project.theme.contains(word))
            conditions.append(Project.description.contains(word))

        query = query.filter(or_(*conditions))

    # 🎯 FILTERS
    if name:
        query = query.filter(Project.name == name)

    if surface:
        query = query.filter(Project.surface == surface)

    total = query.count()
    items = query.offset(skip).limit(limit).all()

    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit
    }

# ===== CREATE =====
@router.post("/")
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    new_project = Project(**project.dict())
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

# ===== UPDATE =====
@router.put("/{project_id}")
def update_project(project_id: int, updated: dict, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Not found")

    for key, value in updated.items():
        setattr(project, key, value)

    db.commit()
    return project

# ===== DELETE =====
@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Not found")

    project.deleted = True
    db.commit()

    return {"message": "deleted"}

# ===== RESTORE =====
@router.put("/restore/{project_id}")
def restore_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Not found")

    project.deleted = False
    db.commit()

    return {"message": "restored"}
