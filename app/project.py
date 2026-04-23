from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/project", tags=["Project"])

# ✅ SCHEMA
class ProjectCreate(BaseModel):
    name: str
    description: str
    surface: str
    theme: str

projects = []

# GET ALL
@router.get("/")
def get_projects():
    active = [p for p in projects if not p.get("deleted")]
    return {
        "items": active,
        "total": len(active),
        "skip": 0,
        "limit": 5
    }

# CREATE (now typed)
@router.post("/")
def create_project(project: ProjectCreate):
    new_project = project.dict()
    new_project["id"] = len(projects) + 1
    new_project["deleted"] = False

    projects.append(new_project)
    return new_project

# UPDATE
@router.put("/{project_id}")
def update_project(project_id: int, updated: dict):
    for p in projects:
        if p["id"] == project_id and not p.get("deleted"):
            p.update(updated)
            return p
    raise HTTPException(status_code=404, detail="Project not found")

# DELETE
@router.delete("/{project_id}")
def delete_project(project_id: int):
    for p in projects:
        if p["id"] == project_id:
            p["deleted"] = True
            return {"message": "project deleted"}
    raise HTTPException(status_code=404, detail="Project not found")

# RESTORE
@router.put("/restore/{project_id}")
def restore_project(project_id: int):
    for p in projects:
        if p["id"] == project_id and p.get("deleted"):
            p["deleted"] = False
            return {"message": "project restored"}
    raise HTTPException(status_code=404, detail="Project not found or not deleted")
