from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.dependencies import get_current_user   # ✅ FIXED

router = APIRouter(prefix="/logs", tags=["Logs"])


@router.get("/")
def get_logs(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    logs = db.query(models.Log).all()

    return logs
