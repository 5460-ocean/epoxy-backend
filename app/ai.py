from fastapi import APIRouter
from pydantic import BaseModel
import os
import json
from openai import OpenAI

router = APIRouter()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class Prompt(BaseModel):
    text: str

@router.post("/ai/generate-style")
async def generate_style(prompt: Prompt):
    user_input = prompt.text.lower()

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": """
You are an epoxy design engine.

Return ONLY JSON:
{
  "colors": ["#hex1", "#hex2"],
  "style": "name"
}

Strict mapping rules:
- desert, sand, dunes → brown, beige, gold (#c2a477, #8b6f47)
- ocean, water → blue tones
- fire → red/orange
- galaxy → purple/black
- forest → green
- marble → white/gray

IMPORTANT:
- NEVER return blue for desert
- ALWAYS follow mappings strictly
"""
            },
            {
                "role": "user",
                "content": user_input
            }
        ]
    )

    # ✅ Parse JSON safely
    try:
        data = json.loads(response.choices[0].message.content)
    except:
        data = {
            "colors": ["#00c6ff", "#003366"],
            "style": "default"
        }

    # ✅ HARD OVERRIDE (guarantee correctness)
    if "desert" in user_input or "dune" in user_input or "sand" in user_input:
        data["colors"] = ["#c2a477", "#8b6f47"]
        data["style"] = "desert"

    return data
