from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["AI"])

class Prompt(BaseModel):
    prompt: str

@router.post("/generate-style")
def generate_style(data: Prompt):
    text = data.prompt.lower()

    # 🌊 OCEAN
    if "ocean" in text or "wave" in text:
        return {
            "colors": ["#00c6ff", "#003366"],
            "style": "waves",
            "speed": 0.05,
            "amplitude": 30
        }

    # 🌌 GALAXY
    if "galaxy" in text or "space" in text:
        return {
            "colors": ["#8e2de2", "#000000"],
            "style": "swirl",
            "speed": 0.02,
            "amplitude": 50
        }

    # 🔥 FIRE
    if "fire" in text:
        return {
            "colors": ["#ff512f", "#dd2476"],
            "style": "chaos",
            "speed": 0.08,
            "amplitude": 40
        }

    # DEFAULT
    return {
        "colors": ["#0077ff", "#001f3f"],
        "style": "waves",
        "speed": 0.04,
        "amplitude": 20
    }
