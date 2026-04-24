from sqlalchemy import or_

@router.get("/")
def get_projects(
    skip: int = 0,
    limit: int = 5,
    search: Optional[str] = None,
    name: Optional[str] = None,
    surface: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Project).filter(Project.deleted == False)

    # 🔥 SMART SEARCH (word-based)
    if search:
        words = search.split()

        conditions = []
        for word in words:
            conditions.append(Project.name.contains(word))
            conditions.append(Project.surface.contains(word))
            conditions.append(Project.theme.contains(word))
            conditions.append(Project.description.contains(word))

        query = query.filter(or_(*conditions))

    # 🎯 filters
    if name:
        query = query.filter(Project.name == name)

    if surface:
        query = query.filter(Project.surface == surface)

    total = query.count()
    items = query.offset(skip).limit(limit).all()

    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit
    }
