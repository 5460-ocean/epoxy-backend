from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app import models
from app.dependencies import get_current_user

router = APIRouter(prefix="/project", tags=["Project"])


@router.get("/")
def get_projects(
    skip: int = 0,
    limit: int = 10,
    search: str = Query(None),
    name: str = Query(None),   # ✅ added
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(models.Project).filter(
        models.Project.owner_id == current_user.id,
        models.Project.is_deleted == False
    )

    # 🔍 search (broad)
    if search:
        query = query.filter(
            or_(
                models.Project.name.ilike(f"%{search}%"),
                models.Project.description.ilike(f"%{search}%")
            )
        )

    # 🎯 exact name filter
    if name:
        query = query.filter(models.Project.name.ilike(f"%{name}%"))

    total = query.count()
    projects = query.offset(skip).limit(limit).all()

    return {
        "items": projects,
        "total": total,
        "skip": skip,
        "limit": limit
    }
