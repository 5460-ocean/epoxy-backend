from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime

app = FastAPI(docs_url="/docs", redoc_url="/redoc", openapi_url="/openapi.json")

projects_db = []
project_counter = 1


@app.get("/")
def root():
    return {"message": "EpoxyDesignAI Backend Running 🚀"}


class CreateProject(BaseModel):
    name: str
    user_id: int


class UpdateStyle(BaseModel):
    surface_id: int
    theme_id: int


class UpdateAssets(BaseModel):
    asset_ids: List[int]


@app.post("/wizard/projects")
def create_project(project: CreateProject):
    global project_counter

    new_project = {
        "id": project_counter,
        "name": project.name,
        "user_id": project.user_id,
        "surface_id": None,
        "theme_id": None,
        "asset_ids": [],
        "status": "draft",
        "created_at": datetime.utcnow().isoformat()
    }

    projects_db.append(new_project)
    project_counter += 1

    return new_project


@app.put("/wizard/projects/{project_id}/style")
def update_style(project_id: int, style: UpdateStyle):
    for project in projects_db:
        if project["id"] == project_id:
            project["surface_id"] = style.surface_id
            project["theme_id"] = style.theme_id
            return project

    raise HTTPException(status_code=404, detail="Project not found")


@app.put("/wizard/projects/{project_id}/assets")
def update_assets(project_id: int, assets: UpdateAssets):
    for project in projects_db:
        if project["id"] == project_id:
            project["asset_ids"] = assets.asset_ids
            return project

    raise HTTPException(status_code=404, detail="Project not found")


# 🔥 NEW STEP 4
@app.put("/wizard/projects/{project_id}/complete")
def complete_project(project_id: int):
    for project in projects_db:
        if project["id"] == project_id:

            if project["surface_id"] is None:
                raise HTTPException(status_code=400, detail="Surface not selected")

            if project["theme_id"] is None:
                raise HTTPException(status_code=400, detail="Theme not selected")

            if not project["asset_ids"]:
                raise HTTPException(status_code=400, detail="No assets selected")

            project["status"] = "completed"
            return project

    raise HTTPException(status_code=404, detail="Project not found")


@app.get("/wizard/projects")
def list_projects():
    return projects_db

