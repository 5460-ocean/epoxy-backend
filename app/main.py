from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# ✅ Mount static folder
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# ✅ Serve index.html at /app
@app.get("/app")
def serve_app():
    return FileResponse("app/static/index.html")

@app.get("/")
def root():
    return {"message": "API running"}
