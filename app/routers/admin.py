# (keep everything else the same above)

@router.get("/projects")
def get_projects(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    check_admin(current_user)

    projects = db.query(models.Project).all()

    result = []
    for p in projects:
        user = db.query(models.User).filter(models.User.id == p.owner_id).first()

        result.append({
            "id": p.id,
            "name": p.name,
            "status": "deleted" if p.is_deleted else "active",
            "creator": user.email if user else None   # ✅ renamed
        })

    return result
