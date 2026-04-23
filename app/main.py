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

# ===== ONLY INCLUDE WHAT EXISTS =====
from app.auth import router as auth_router
from app.ai import router as ai_router

app.include_router(auth_router)
app.include_router(ai_router)

# ===== STATIC =====
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# ===== ROOT =====
@app.get("/")
def root():
    return {"message": "API is running"}

# ===== FRONTEND =====
@app.get("/app")
def serve_app():
    return FileResponse("app/static/index.html")
