# copy manually into your router (don't overwrite whole file)

from app.auth import get_current_user

@router.post("/", response_model=schemas.ProjectOut)
def create_project(
    project: schemas.ProjectBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)  # ✅ ADD THIS
):
    new_project = models.Project(
        **project.dict(),
        owner_id=current_user.id   # ✅ THIS FIXES EVERYTHING
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project
