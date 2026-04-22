from fastapi import APIRouter

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/generate-style")
def generate_style(data: dict):
    text = data.get("text", "").lower()

    # 🌌 GALAXY
    if "space" in text or "galaxy" in text:
        return {
            "colors": ["#000000", "#8e2de2", "#4facfe", "#ff00cc"]
        }

    # 🌊 OCEAN
    if "ocean" in text or "water" in text:
        return {
            "colors": ["#001f3f", "#0074D9", "#00c6ff"]
        }

    # 🔥 FIRE
    if "fire" in text or "lava" in text:
        return {
            "colors": ["#ff512f", "#ff0000", "#ffff00"]
        }

    # 🏜️ DESERT
    if "desert" in text or "dunes" in text:
        return {
            "colors": ["#c2a679", "#a67c52", "#8c6239"]
        }

    # 🪨 MARBLE
    if "marble" in text:
        return {
            "colors": ["#eeeeee", "#bbbbbb", "#777777"]
        }

    # fallback
    return {
        "colors": ["#00c6ff", "#003366"]
    }
