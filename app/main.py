from fastapi import FastAPI
from app.database import Base, engine

# ✅ Import models FIRST
from app import models

# ✅ Routers
from app.routers.auth import router as auth_router
from app.routers.project import router as project_router
from app.routers.admin import router as admin_router
from app.routers.logs import router as logs_router
from app.routers.analytics import router as analytics_router

app = FastAPI()

# 🔥 TEMP RESET DATABASE (ONLY FOR CLEAN START)
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

# ✅ Include routers
app.include_router(auth_router)
app.include_router(project_router)
app.include_router(admin_router)
app.include_router(logs_router)
app.include_router(analytics_router)


@app.get("/")
def root():
    return {"message": "API is running"}
