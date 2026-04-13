from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models
from app.auth import get_current_user

router = APIRouter(prefix="/analytics/logs", tags=["Analytics Logs"])


@router.get("/")
def get_logs_analytics(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 🔐 Admin only
    if current_user.role != "admin":
        return {"detail": "Admin only"}

    # 📊 Total logs
    total_logs = db.query(models.Log).count()

    # 📊 Actions breakdown
    action_counts = (
        db.query(models.Log.action, func.count(models.Log.id))
        .group_by(models.Log.action)
        .all()
    )

    actions_breakdown = {action: count for action, count in action_counts}

    # 📊 Most common action
    most_common_action = None
    if action_counts:
        most_common_action = max(action_counts, key=lambda x: x[1])[0]

    # 📊 Top user
    user_counts = (
        db.query(models.User.email, func.count(models.Log.id))
        .join(models.Log, models.Log.user_id == models.User.id)
        .group_by(models.User.email)
        .all()
    )

    top_user = None
    if user_counts:
        top_user = max(user_counts, key=lambda x: x[1])[0]

    return {
        "total_logs": total_logs,
        "most_common_action": most_common_action,
        "top_user": top_user,
        "actions_breakdown": actions_breakdown
    }
