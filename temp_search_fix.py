# Replace ONLY get_projects function

@router.get("/", response_model=ProjectList)
def get_projects(
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None,
    name: Optional[str] = None,
    surface: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Project)

    # 🔐 ownership filter
    if current_user.role != "admin":
        query = query.filter(models.Project.owner_id == current_user.id)

    # 🔥 GLOBAL SEARCH (dominates)
    if search:
        query = query.filter(
            or_(
                models.Project.name.ilike(f"%{search}%"),
                models.Project.description.ilike(f"%{search}%"),
                models.Project.surface.ilike(f"%{search}%"),
                models.Project.theme.ilike(f"%{search}%")
            )
        )
    else:
        # ✅ apply filters ONLY if no search
        if name:
            query = query.filter(models.Project.name.ilike(f"%{name}%"))

        if surface:
            query = query.filter(models.Project.surface.ilike(f"%{surface}%"))

    total = query.count()
    projects = query.offset(skip).limit(limit).all()

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": projects
    }
