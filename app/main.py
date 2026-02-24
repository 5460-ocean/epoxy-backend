from fastapi import FastAPI

app = FastAPI(docs_url="/docs", redoc_url="/redoc", openapi_url="/openapi.json")

@app.get("/")
def root():
            return {"message": "EpoxyDesignAI Backend Running 🚀"}

from pydantic import BaseModel
from typing import List

# Define the Project model
class Project(BaseModel):
    name: str
        surface_id: int
            theme_id: int
                asset_ids: List[int]
                    user_id: int

                    # Add the POST endpoint
                    @app.post("/wizard/projects")
                    def create_project(project: Project):
                        return {
                                "id": 1,
                                        "name": project.name,
                                                "surface_id": project.surface_id,
                                                        "theme_id": project.theme_id,
                                                                "user_id": project.user_id,
                                                                        "created_at": "2026-02-24T15:09:52.274Z"
                                                                            }
