from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os, json
from openai import OpenAI

# ✅ import your routers (correct structure)
from app.routers import auth, project, admin, logs, analytics

app = FastAPI()

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ include existing routes
app.include_router(auth.router)
app.include_router(project.router)
app.include_router(admin.router)
app.include_router(logs.router)
app.include_router(analytics.router)

# ===== SERVE FRONTEND =====
@app.get("/app")
def serve_app():
    return FileResponse("app/static/index.html")

# ===== ROOT =====
@app.get("/")
def root():
    return {"message": "Epoxy Backend Running"}

# ===== AI SETUP =====
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None

# ===== AI ROUTE =====
@app.post("/ai/generate-style")
async def generate_style(data: dict = Body(...)):
    text = data.get("text", "").lower()

    # 🔥 guarantee dunes not blue
    if "desert" in text or "dune" in text or "sand" in text:
        return {
            "colors": ["#c2a477", "#8b6f47"],
            "style": "desert"
        }

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
                {"role": "system", "content": "Return JSON with two hex colors"},
                {"role": "user", "content": text}
            ]
        )

        result = json.loads(response.choices[0].message.content)

    except:
        result = {
            "colors": ["#00c6ff", "#003366"],
            "style": "default"
        }

    return result
