from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os

# ✅ Import routers
from app.routers import auth, project, admin, logs, analytics
from app.ai import router as ai_router

app = FastAPI(
    servers=[
        {"url": "https://epoxy-backend-106r.onrender.com"}
    ]
)

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include routers
app.include_router(auth.router)
app.include_router(project.router)
app.include_router(admin.router)
app.include_router(logs.router)
app.include_router(analytics.router)
app.include_router(ai_router)

# ✅ Root
@app.get("/")
def root():
    return {"message": "API is running"}

# ✅ Frontend
@app.get("/app")
def serve_app():
    base_dir = os.path.dirname(__file__)
    file_path = os.path.join(base_dir, "static", "index.html")
    return FileResponse(file_path)
# ===== CREATE DATABASE TABLES =====
from app.database import Base, engine

Base.metadata.create_all(bind=engine)
# ===== FIX STATIC FILES =====
from fastapi.staticfiles import StaticFiles

app.mount("/static", StaticFiles(directory="app/static"), name="static")
# ===== AUTO CREATE DB TABLES =====
from app.database import Base, engine

Base.metadata.create_all(bind=engine)
# ===== FIX /app ROUTE =====
from fastapi.responses import FileResponse
import os

@app.get("/app")
def serve_app():
    base_dir = os.path.dirname(__file__)
    file_path = os.path.join(base_dir, "static", "index.html")

    if not os.path.exists(file_path):
        return {"error": "index.html not found"}

    return FileResponse(file_path)
