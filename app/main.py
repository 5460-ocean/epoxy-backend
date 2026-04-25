from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# ✅ Import routers
from app.auth import router as auth_router
from app.project import router as project_router
from app.ai import router as ai_router
from app.admin import router as admin_router
from app.logs import router as logs_router
from app.analytics import router as analytics_router

app = FastAPI()

# ✅ Include ALL routes
app.include_router(auth_router)
app.include_router(project_router)
app.include_router(ai_router)
app.include_router(admin_router)
app.include_router(logs_router)
app.include_router(analytics_router)

# ✅ Static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# ✅ Serve frontend
@app.get("/app")
def serve_app():
    return FileResponse("app/static/index.html")

@app.get("/")
def root():
    return {"message": "API running"}
