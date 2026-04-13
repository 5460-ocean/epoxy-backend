@router.get("/logs")
def get_logs(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    logs = db.query(Log).all()

    return [
        {
            "action": log.action,
            "user_email": log.user_email,
            "details": log.details
        }
        for log in logs
    ]
