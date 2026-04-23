from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/project", tags=["Project"])

projects = []

# GET ALL (only active)
@router.get("/")
def get_projects():
    active = [p for p in projects if not p.get("deleted")]
    return {
        "items": active,
        "total": len(active),
        "skip": 0,
        "limit": 5
    }

# CREATE
@router.post("/")
def create_project(project: dict):
    project["id"] = len(projects) + 1
    project["deleted"] = False
    projects.append(project)
    return project

# UPDATE
@router.put("/{project_id}")
def update_project(project_id: int, updated: dict):
    for p in projects:
        if p["id"] == project_id and not p.get("deleted"):
            p.update(updated)
            return p
    raise HTTPException(status_code=404, detail="Project not found")

# DELETE (soft delete)
@router.delete("/{project_id}")
def delete_project(project_id: int):
    for p in projects:
        if p["id"] == project_id:
            p["deleted"] = True
            return {"message": "project deleted"}
    raise HTTPException(status_code=404, detail="Project not found")

# 🔥 RESTORE
@router.put("/restore/{project_id}")
def restore_project(project_id: int):
    for p in projects:
        if p["id"] == project_id and p.get("deleted"):
            p["deleted"] = False
            return {"message": "project restored"}
    raise HTTPException(status_code=404, detail="Project not found or not deleted")
