from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import os, json
from openai import OpenAI

# ✅ CREATE APP FIRST
app = FastAPI()

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ OpenAI client (safe init)
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None


# ===== EXISTING ROOT =====
@app.get("/")
def root():
    return {"message": "Epoxy Backend Running"}


# ===== AI ROUTE =====
@app.post("/ai/generate-style")
async def generate_style(data: dict = Body(...)):
    text = data.get("text", "").lower()

    # ✅ HARD FIX (guarantee dunes correct)
    if "desert" in text or "dune" in text or "sand" in text:
        return {
            "colors": ["#c2a477", "#8b6f47"],
            "style": "desert"
        }

    # ✅ fallback if no API key
    if client is None:
        return {
            "colors": ["#00c6ff", "#003366"],
            "style": "default"
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
from fastapi.responses import FileResponse

@app.get("/app")
def serve_app():
    return FileResponse("index.html")
