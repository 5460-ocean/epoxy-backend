from fastapi import FastAPI
from app.database import engine, Base
from app.routers import project

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(project.router)


@app.get("/", response_model=dict)
def root():
    return {"message": "EpoxyDesignAI Backend Running 🚀"}
