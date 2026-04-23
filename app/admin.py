from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["Admin"])

users = []

# GET USERS
@router.get("/users")
def get_users():
    return users

# UPDATE USER
@router.put("/users/{user_id}")
def update_user(user_id: int, data: dict):
    for u in users:
        if u["id"] == user_id:
            u.update(data)
            return u
    return {"error": "user not found"}

# DELETE USER (soft)
@router.delete("/users/{user_id}")
def delete_user(user_id: int):
    for u in users:
        if u["id"] == user_id:
            u["deleted"] = True
            return {"message": "user deleted"}
    return {"error": "user not found"}

# RESTORE USER
@router.put("/users/restore/{user_id}")
def restore_user(user_id: int):
    for u in users:
        if u["id"] == user_id and u.get("deleted"):
            u["deleted"] = False
            return {"message": "user restored"}
    return {"error": "user not found or not deleted"}
