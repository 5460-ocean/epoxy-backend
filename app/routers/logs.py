from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app import models
from app.auth import get_current_user

router = APIRouter(prefix="/logs", tags=["Logs"])


@router.get("/")
def get_logs(
    skip: int = Query(0),
    limit: int = Query(10),
    user_id: Optional[int] = Query(None),
    action: Optional[str] = Query(None),
    project_id: Optional[int] = Query(None),
    sort: str = Query("timestamp"),

    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # ✅ STEP 1 — JOIN logs with users
    query = db.query(models.Log, models.User).join(
        models.User, models.Log.user_id == models.User.id
    )

    # 🔍 Filtering
    if user_id:
        query = query.filter(models.Log.user_id == user_id)

    if action:
        query = query.filter(models.Log.action.ilike(f"%{action}%"))

    if project_id:
        query = query.filter(models.Log.project_id == project_id)

    # 🔄 Sorting
    if sort.startswith("-"):
        field = sort[1:]
        query = query.order_by(getattr(models.Log, field).desc())
    else:
        query = query.order_by(getattr(models.Log, sort).asc())

    total = query.count()

    # ✅ STEP 2 — Format clean response (email instead of user_id)
    results = query.offset(skip).limit(limit).all()

    items = []
    for log, user in results:
        items.append({
            "id": log.id,
            "action": log.action,
            "project_id": log.project_id,
            "timestamp": log.timestamp,
            "user_email": user.email
        })

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": items
    }
