@router.get("/projects")
def get_all_projects(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return db.query(Project).filter(Project.is_deleted == False).all()
