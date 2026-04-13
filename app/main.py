from fastapi import FastAPI
from app.routers import auth, project, admin, logs, analytics

app = FastAPI()

app.include_router(auth.router)
app.include_router(project.router)
app.include_router(admin.router)
app.include_router(logs.router)
app.include_router(analytics.router)

@app.get("/")
def root():
    return {"message": "API is running"}
