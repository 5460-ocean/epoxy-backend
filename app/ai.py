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

    # fallback for safety (WORKS EVEN WITHOUT AI)
    if "desert" in user_input or "dune" in user_input or "sand" in user_input:
        return {
            "colors": ["#c2a477", "#8b6f47"],
            "style": "desert"
        }

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": "Return JSON with colors only"
            },
            {
                "role": "user",
                "content": user_input
            }
        ]
    )

    try:
        data = json.loads(response.choices[0].message.content)
    except:
        data = {
            "colors": ["#00c6ff", "#003366"],
            "style": "default"
        }

    return data
