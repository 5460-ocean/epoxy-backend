from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.database import get_db
from app import models
from app.auth import get_current_user

router = APIRouter(prefix="/analytics/logs/actions-time", tags=["Analytics Logs Actions Time"])


@router.get("/")
def logs_actions_over_time(
    days: int = Query(7, description="Number of days to look back"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 🔐 Admin only
    if current_user.role != "admin":
        return {"detail": "Admin only"}

    since_date = datetime.utcnow() - timedelta(days=days)

    results = (
        db.query(
            models.Log.action,
            func.date(models.Log.timestamp).label("day"),
            func.count(models.Log.id)
        )
        .filter(models.Log.timestamp >= since_date)
        .group_by(models.Log.action, func.date(models.Log.timestamp))
        .order_by(models.Log.action, func.date(models.Log.timestamp))
        .all()
    )

    data = {}

    for action, day, count in results:
        if action not in data:
            data[action] = {}
        data[action][str(day)] = count

    return {
        "days_filter": days,
        "actions_over_time": data
    }
