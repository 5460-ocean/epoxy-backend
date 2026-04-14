from app import models

def create_log(db, user_id: int, action: str):
    print("🔥 LOGGING:", action)   # DEBUG

    log = models.Log(
        user_id=user_id,
        action=action
    )
    db.add(log)
    db.commit()
