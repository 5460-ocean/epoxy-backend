from fastapi import FastAPI

from app.routers import auth
from app.routers import wizard
from app.routers import admin

app = FastAPI(
    title="SaaS Backend",
    description="FastAPI SaaS backend with JWT authentication",
    version="1.0.0"
)

# Authentication routes
app.include_router(
    auth.router,
    tags=["auth"]
)

# User project routes
app.include_router(
    wizard.router,
    prefix="/wizard",
    tags=["wizard"]
)

# Admin routes
app.include_router(
    admin.router,
    prefix="/admin",
    tags=["admin"]
)

@app.get("/")
def root():
    return {"message": "SaaS backend running"}
