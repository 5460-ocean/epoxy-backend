from sqlalchemy.orm import Session
from app.models.activity_log import ActivityLog


def log_activity(db: Session, user_id: int, action: str, entity: str, entity_id: int = None):
    log = ActivityLog(
        user_id=user_id,
        action=action,
        entity=entity,
        entity_id=entity_id
    )

    db.add(log)
    db.commit()
