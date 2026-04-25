from fastapi import APIRouter

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/generate-style")
async def generate_style(data: dict):
    prompt = data.get("prompt", "").lower()

    if "ocean" in prompt:
        return {
            "colors": ["#1CA7EC", "#023E8A"],
            "amplitude": 25,
            "speed": 0.08,
            "type": "waves"
        }

    if "galaxy" in prompt:
        return {
            "colors": ["#ff00cc", "#3333ff"],
            "amplitude": 10,
            "speed": 0.03,
            "type": "swirl"
        }

    if "fire" in prompt:
        return {
            "colors": ["#ff4d00", "#000000"],
            "amplitude": 40,
            "speed": 0.12,
            "type": "chaos"
        }

    return {
        "colors": ["#00c6ff", "#003366"],
        "amplitude": 20,
        "speed": 0.05,
        "type": "waves"
    }
