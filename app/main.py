from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== ROUTES IMPORT =====
from app.auth import router as auth_router
from app.project import router as project_router
from app.admin import router as admin_router
from app.logs import router as logs_router
from app.analytics import router as analytics_router
from app.ai import router as ai_router

app.include_router(auth_router)
app.include_router(project_router)
app.include_router(admin_router)
app.include_router(logs_router)
app.include_router(analytics_router)
app.include_router(ai_router)

# ===== STATIC =====
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# ===== ROOT =====
@app.get("/")
def root():
    return {"message": "API is running"}

# ===== FRONTEND =====
@app.get("/app")
def serve_app():
    return FileResponse("app/static/index.html")
# ===== SAFE STARTUP DB INIT =====
@app.on_event("startup")
def startup():
    try:
        from app.database import Base, engine
        Base.metadata.create_all(bind=engine)
        print("DB ready")
    except Exception as e:
        print("DB init failed:", e)
