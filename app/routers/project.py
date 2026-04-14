from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user
from app.utils.logger import create_log

router = APIRouter(prefix="/project", tags=["Project"])


# ✅ FIXED GET PROJECTS
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

    # ✅ CONVERT TO DICT USING SCHEMA
    return {
        "items": [schemas.ProjectOut.model_validate(p) for p in projects],
        "total": total,
        "skip": skip,
        "limit": limit
    }
