from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.database import get_db
from app import models
from app.dependencies import get_current_user

router = APIRouter(prefix="/analytics/logs/time", tags=["Analytics Logs Time"])


@router.get("/")
def logs_time_analytics(
    days: int = Query(7, description="Number of days to look back"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 🔐 Admin only
    if current_user.role != "admin":
        return {"detail": "Admin only"}

    # 📅 Time filter
    since_date = datetime.utcnow() - timedelta(days=days)

    logs = (
        db.query(
            func.date(models.Log.timestamp).label("day"),
            func.count(models.Log.id)
        )
        .filter(models.Log.timestamp >= since_date)
        .group_by(func.date(models.Log.timestamp))
        .order_by(func.date(models.Log.timestamp))
        .all()
    )

    logs_per_day = {str(day): count for day, count in logs}

    return {
        "days_filter": days,
        "logs_per_day": logs_per_day
    }
