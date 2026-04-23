from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["Admin"])

users = []
projects = []

# ===== USERS =====

@router.get("/users")
def get_users():
    return users

@router.put("/users/{user_id}")
def update_user(user_id: int, data: dict):
    for u in users:
        if u["id"] == user_id:
            u.update(data)
            return u
    return {"error": "user not found"}

@router.delete("/users/{user_id}")
def delete_user(user_id: int):
    for u in users:
        if u["id"] == user_id:
            u["deleted"] = True
            return {"message": "user deleted"}
    return {"error": "user not found"}

@router.put("/users/restore/{user_id}")
def restore_user(user_id: int):
    for u in users:
        if u["id"] == user_id and u.get("deleted"):
            u["deleted"] = False
            return {"message": "user restored"}
    return {"error": "user not found or not deleted"}

# ===== PROJECTS (ADMIN CONTROL) =====

@router.get("/projects")
def get_projects():
    return projects

@router.put("/projects/{project_id}")
def update_project(project_id: int, data: dict):
    for p in projects:
        if p["id"] == project_id:
            p.update(data)
            return p
    return {"error": "project not found"}

@router.delete("/projects/{project_id}")
def delete_project(project_id: int):
    for p in projects:
        if p["id"] == project_id:
            p["deleted"] = True
            return {"message": "project deleted"}
    return {"error": "project not found"}

@router.put("/projects/restore/{project_id}")
def restore_project(project_id: int):
    for p in projects:
        if p["id"] == project_id and p.get("deleted"):
            p["deleted"] = False
            return {"message": "project restored"}
    return {"error": "project not found or not deleted"}
