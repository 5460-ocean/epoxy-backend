from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ✅ import all routers
from app.routers import auth, project, admin, logs, analytics
from app.ai import router as ai_router

app = FastAPI()

# ✅ CORS (keep your frontend working)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ include ALL routers
app.include_router(auth.router)
app.include_router(project.router)
app.include_router(admin.router)
app.include_router(logs.router)
app.include_router(analytics.router)

# ✅ include AI router LAST
app.include_router(ai_router)
