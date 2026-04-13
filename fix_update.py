@router.put("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: int,
    updated: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id,
        Project.is_deleted == False
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.name = updated.name
    project.description = updated.description
    project.surface = updated.surface
    project.theme = updated.theme

    db.commit()
    db.refresh(project)

    log_action(
        db,
        "UPDATE_PROJECT",
        current_user.email,
        f"Updated project '{project.name}'"
    )

    return project
