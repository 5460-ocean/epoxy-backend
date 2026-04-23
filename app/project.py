from fastapi import APIRouter

router = APIRouter(prefix="/project", tags=["Project"])

projects = []

@router.get("/")
def get_projects():
    return {
        "items": projects,
        "total": len(projects),
        "skip": 0,
        "limit": 5
    }

@router.post("/")
def create_project(project: dict):
    projects.append(project)
    return {"message": "project created"}
