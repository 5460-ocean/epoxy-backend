from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/project", tags=["Project"])

projects = []

# GET ALL
@router.get("/")
def get_projects():
    return {
        "items": projects,
        "total": len(projects),
        "skip": 0,
        "limit": 5
    }

# CREATE
@router.post("/")
def create_project(project: dict):
    project["id"] = len(projects) + 1
    projects.append(project)
    return project

# UPDATE
@router.put("/{project_id}")
def update_project(project_id: int, updated: dict):
    for i, p in enumerate(projects):
        if p["id"] == project_id:
            projects[i].update(updated)
            return projects[i]
    raise HTTPException(status_code=404, detail="Project not found")

# DELETE
@router.delete("/{project_id}")
def delete_project(project_id: int):
    for i, p in enumerate(projects):
        if p["id"] == project_id:
            deleted = projects.pop(i)
            return {"deleted": deleted}
    raise HTTPException(status_code=404, detail="Project not found")
