from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ✅ DATABASE
from app.database import Base, engine
from app.models.project import Project

# ✅ ROUTERS
from app.auth import router as auth_router
from app.project import router as project_router
from app.ai import router as ai_router
from app.admin import router as admin_router
from app.logs import router as logs_router
from app.analytics import router as analytics_router

app = FastAPI()

# ✅ CREATE TABLES AUTOMATICALLY
Base.metadata.create_all(bind=engine)

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ INCLUDE ROUTES
app.include_router(auth_router)
app.include_router(project_router)
app.include_router(ai_router)
app.include_router(admin_router)
app.include_router(logs_router)
app.include_router(analytics_router)

# ✅ ROOT
@app.get("/")
def root():
    return {"message": "API is running"}

# ✅ SERVE FRONTEND
from fastapi.responses import FileResponse

@app.get("/app")
def serve_app():
    return FileResponse("app/static/index.html")
