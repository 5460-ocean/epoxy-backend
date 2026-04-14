from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app import models
from app.dependencies import get_current_user
from app.utils.logger import create_log

router = APIRouter(prefix="/project", tags=["Project"])


# ✅ SAFE GET PROJECTS (manual serialization)
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

    # 🔥 MANUAL SERIALIZATION (guaranteed safe)
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
