# ===== AI ROUTE (SAFE ADD) =====

from fastapi import Body
import os, json
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.post("/ai/generate-style")
async def generate_style(data: dict = Body(...)):
    text = data.get("text", "").lower()

    # ✅ HARD RULE FIX (guarantee dunes not blue)
    if "desert" in text or "dune" in text or "sand" in text:
        return {
            "colors": ["#c2a477", "#8b6f47"],
            "style": "desert"
        }

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": "Return JSON with exactly two hex colors"
                },
                {
                    "role": "user",
                    "content": text
                }
            ]
        )

        result = json.loads(response.choices[0].message.content)

    except:
        result = {
            "colors": ["#00c6ff", "#003366"],
            "style": "default"
        }

    return result
