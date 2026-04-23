from fastapi import APIRouter

router = APIRouter(prefix="/logs", tags=["Logs"])

@router.get("/")
def get_logs():
    return []
