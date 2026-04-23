from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/users")
def get_users():
    return []

@router.get("/projects")
def get_projects():
    return []
