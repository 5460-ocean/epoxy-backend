from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== IMPORT ROUTERS =====
from app.auth import router as auth_router
from app.project import router as project_router
from app.ai import router as ai_router

# OPTIONAL (only if files exist)
try:
    from app.admin import router as admin_router
    app.include_router(admin_router)
except:
    pass

try:
    from app.logs import router as logs_router
    app.include_router(logs_router)
except:
    pass

try:
    from app.analytics import router as analytics_router
    app.include_router(analytics_router)
except:
    pass

# REQUIRED ROUTERS
app.include_router(auth_router)
app.include_router(project_router)
app.include_router(ai_router)

# STATIC
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# ROOT
@app.get("/")
def root():
    return {"message": "API is running"}

# FRONTEND
@app.get("/app")
def serve_app():
    return FileResponse("app/static/index.html")
