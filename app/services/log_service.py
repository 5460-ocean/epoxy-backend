from sqlalchemy.orm import Session
from app import models


def create_log(db: Session, user_id: int, action: str, project_id: int = None):
    log = models.Log(
        user_id=user_id,
        action=action,
        project_id=project_id
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
