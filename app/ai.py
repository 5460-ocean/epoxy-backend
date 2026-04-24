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
            "colors": ["#00c6ff", "#003366"]
        }

    # 🌌 GALAXY
    if "galaxy" in text or "space" in text:
        return {
            "colors": ["#8e2de2", "#000000"]
        }

    # 🔥 FIRE / LAVA
    if "fire" in text or "lava" in text:
        return {
            "colors": ["#ff512f", "#dd2476"]
        }

    # 🌲 NATURE
    if "forest" in text or "nature" in text:
        return {
            "colors": ["#134e5e", "#71b280"]
        }

    # DEFAULT (better than black)
    return {
        "colors": ["#0077ff", "#001f3f"]
    }
