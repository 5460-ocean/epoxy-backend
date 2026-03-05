from fastapi import FastAPI
from app.database import engine, Base
from app.routers import project, auth

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Public routes
app.include_router(auth.router)

# Protected routes
app.include_router(project.router)


@app.get("/")
def root():
    return {"message": "EpoxyDesignAI Backend Running 🚀"}
