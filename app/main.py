from fastapi import FastAPI
from app.database import Base, engine

app = FastAPI()

# 🔥 TEMP: reset DB to include role column
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

from app.routers import auth, project, admin, logs, analytics

app.include_router(auth.router)
app.include_router(project.router)
app.include_router(admin.router)
app.include_router(logs.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    return {"message": "API is running"}
