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

