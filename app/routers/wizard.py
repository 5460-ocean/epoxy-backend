from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def wizard_home():
    return {"message": "wizard works"}
