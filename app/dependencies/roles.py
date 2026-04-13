from fastapi import Depends, HTTPException
from app.dependencies.auth import get_current_user

def require_role(required_roles: list):
    def role_checker(user = Depends(get_current_user)):
        if user.role not in required_roles:
            raise HTTPException(status_code=403, detail="Forbidden")
        return user
    return role_checker
