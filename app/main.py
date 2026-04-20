from fastapi import FastAPI
from app.database import Base, engine

from app import models

from app.routers.auth import router as auth_router
from app.routers.project import router as project_router
from app.routers.admin import router as admin_router
from app.routers.logs import router as logs_router
from app.routers.analytics import router as analytics_router

app = FastAPI(openapi_tags=[])

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(project_router)
app.include_router(admin_router)
app.include_router(logs_router)
app.include_router(analytics_router)


@app.get("/")
def root():
    return {"message": "API is running"}

from fastapi.responses import FileResponse

@app.get("/app")
def serve_frontend():
    return FileResponse("index.html")


from fastapi.responses import FileResponse

@app.get("/app")
def serve_frontend():
    return FileResponse("index.html")


from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== FRONTEND ROUTE =====
from fastapi.responses import FileResponse

@app.get("/app")
def serve_app():
    return FileResponse("app/static/index.html")


# ===== AI ROUTE =====
from fastapi import Body
import os, json
from openai import OpenAI

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None

@app.post("/ai/generate-style")
async def generate_style(data: dict = Body(...)):
    text = data.get("text", "").lower()

    # force desert colors
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

        return json.loads(response.choices[0].message.content)

    except:
        return {
            "colors": ["#00c6ff", "#003366"],
            "style": "default"
        }
