from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 👇 your existing routers (keep these if you had them)
from app.routes import auth, project, admin, logs, analytics

# 👇 NEW AI ROUTER
from app.ai import router as ai_router

app = FastAPI()

# ✅ CORS (important for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 👇 existing routes
app.include_router(auth.router)
app.include_router(project.router)
app.include_router(admin.router)
app.include_router(logs.router)
app.include_router(analytics.router)

# 👇 🚀 ADD THIS LINE (THIS IS THE FIX)
app.include_router(ai_router)


@app.get("/")
def root():
    return {"message": "Epoxy Backend Running"}
