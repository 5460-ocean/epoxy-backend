from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ ONLY SAFE ROUTERS
from app.auth import router as auth_router
from app.ai import router as ai_router

app.include_router(auth_router)
app.include_router(ai_router)

app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/")
def root():
    return {"message": "API is running"}

@app.get("/app")
def serve_app():
    return FileResponse("app/static/index.html")

from app.project import router as project_router
app.include_router(project_router)

