from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== BASIC ROUTES =====
@app.get("/")
def root():
    return {"message": "API is running"}

# ===== STATIC FILES =====
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# ===== FRONTEND =====
@app.get("/app")
def serve_app():
    return FileResponse("app/static/index.html")

# ===== TEMP TEST ROUTE =====
@app.get("/test")
def test():
    return {"status": "ok"}
