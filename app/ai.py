from fastapi import APIRouter, Body

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/generate-style")
async def generate_style(data: dict = Body(...)):
    text = data.get("text", "").lower()

    if "desert" in text or "dune" in text or "sand" in text:
        return {"colors": ["#c2a477", "#8b6f47"]}

    if "ocean" in text:
        return {"colors": ["#00c6ff", "#003366"]}

    if "fire" in text:
        return {"colors": ["#ff512f", "#dd2476"]}

    return {"colors": ["#00c6ff", "#003366"]}
