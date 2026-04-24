from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/project", tags=["Project"])

class ProjectCreate(BaseModel):
    name: str
    description: str
    surface: str
    theme: str

projects = []

# ✅ RESTORED FILTERS
@router.get("/")
def get_projects(
    skip: int = 0,
    limit: int = 5,
    search: Optional[str] = None,
    name: Optional[str] = None,
    surface: Optional[str] = None,
):
    results = [p for p in projects if not p.get("deleted")]

    # 🔍 search
    if search:
        results = [
            p for p in results
            if search.lower() in p["name"].lower()
        ]

    # 🎯 filters
    if name:
        results = [p for p in results if p["name"] == name]

    if surface:
        results = [p for p in results if p["surface"] == surface]

    return {
        "items": results[skip: skip + limit],
        "total": len(results),
        "skip": skip,
        "limit": limit
    }

@router.post("/")
def create_project(project: ProjectCreate):
    new_project = project.dict()
    new_project["id"] = len(projects) + 1
    new_project["deleted"] = False
    projects.append(new_project)
    return new_project

@router.put("/{project_id}")
def update_project(project_id: int, updated: dict):
    for p in projects:
        if p["id"] == project_id and not p.get("deleted"):
            p.update(updated)
            return p
    raise HTTPException(status_code=404, detail="Project not found")

@router.delete("/{project_id}")
def delete_project(project_id: int):
    for p in projects:
        if p["id"] == project_id:
            p["deleted"] = True
            return {"message": "project deleted"}
    raise HTTPException(status_code=404, detail="Project not found")

@router.put("/restore/{project_id}")
def restore_project(project_id: int):
    for p in projects:
        if p["id"] == project_id and p.get("deleted"):
            p["deleted"] = False
            return {"message": "project restored"}
    raise HTTPException(status_code=404, detail="Project not found or not deleted")
