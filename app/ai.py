from fastapi import APIRouter
from pydantic import BaseModel
import os
from openai import OpenAI

router = APIRouter()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class Prompt(BaseModel):
    text: str

@router.post("/ai/generate-style")
async def generate_style(prompt: Prompt):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """
You are an epoxy design engine.

Convert user descriptions into JSON with:
- colors: exactly two HEX colors
- style: short keyword

Rules:
- desert, sand, dunes → brown, beige, gold
- ocean, water → blue tones
- fire → red, orange
- galaxy → purple, black
- forest → green tones
- marble → white, gray

Return ONLY valid JSON like:
{"colors": ["#hex1", "#hex2"], "style": "name"}
"""
            },
            {
                "role": "user",
                "content": prompt.text
            }
        ]
    )

    return {
        "result": response.choices[0].message.content
    }
