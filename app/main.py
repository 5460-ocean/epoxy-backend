from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from datetime import datetime

app = FastAPI(docs_url="/docs", redoc_url="/redoc", openapi_url="/openapi.json")

# In-memory storage
projects_db = []
project_counter = 1


@app.get("/")
def root():
    return {"message": "EpoxyDesignAI Backend Running 🚀"}


    class Project(BaseModel):
        name: str
            surface_id: int
                theme_id: int
                    asset_ids: List[int]
                        user_id: int


                        @app.post("/wizard/projects")
                        def create_project(project: Project):
                            global project_counter

                                new_project = {
                                        "id": project_counter,
                                                "name": project.name,
                                                        "surface_id": project.surface_id,
                                                                "theme_id": project.theme_id,
                                                                        "asset_ids": project.asset_ids,
                                                                                "user_id": project.user_id,
                                                                                        "created_at": datetime.utcnow().isoformat()
                                                                                            }

                                                                                                projects_db.append(new_project)
                                                                                                    project_counter += 1

                                                                                                        return new_project


                                                                                                        @app.get("/wizard/projects")
                                                                                                        def list_projects():
                                                                                                            return projects_db
