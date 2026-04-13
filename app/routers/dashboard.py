from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models
from app.auth import get_current_user

router = APIRouter(prefix="/analytics/dashboard", tags=["Dashboard"])


@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 🔐 Admin only
    if current_user.role != "admin":
        return {"detail": "Admin only"}

    # 📊 PROJECT STATS
    total_projects = db.query(models.Project).count()
    active_projects = db.query(models.Project).filter(models.Project.is_deleted == False).count()

    by_surface_query = (
        db.query(models.Project.surface, func.count(models.Project.id))
        .filter(models.Project.is_deleted == False)
        .group_by(models.Project.surface)
        .all()
    )
    by_surface = {surface: count for surface, count in by_surface_query}

    # 📜 LOG STATS
    total_logs = db.query(models.Log).count()

    most_common_action = (
        db.query(models.Log.action, func.count(models.Log.id))
        .group_by(models.Log.action)
        .order_by(func.count(models.Log.id).desc())
        .first()
    )
    most_common_action = most_common_action[0] if most_common_action else None

    # 📈 LOGS PER DAY
    logs_per_day_query = (
        db.query(
            func.date(models.Log.timestamp),
            func.count(models.Log.id)
        )
        .group_by(func.date(models.Log.timestamp))
        .all()
    )
    logs_per_day = {str(day): count for day, count in logs_per_day_query}

    # 🔥 ACTIONS OVER TIME
    actions_query = (
        db.query(
            models.Log.action,
            func.date(models.Log.timestamp),
            func.count(models.Log.id)
        )
        .group_by(models.Log.action, func.date(models.Log.timestamp))
        .all()
    )

    actions_over_time = {}
    for action, day, count in actions_query:
        if action not in actions_over_time:
            actions_over_time[action] = {}
        actions_over_time[action][str(day)] = count

    return {
        "projects": {
            "total": total_projects,
            "active": active_projects,
            "by_surface": by_surface
        },
        "logs": {
            "total": total_logs,
            "most_common_action": most_common_action
        },
        "activity": {
            "logs_per_day": logs_per_day,
            "actions_over_time": actions_over_time
        }
    }
