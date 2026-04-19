from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ✅ import your existing routers (based on your working app)
from app.auth import router as auth_router
from app.project import router as project_router
from app.admin import router as admin_router
from app.logs import router as logs_router
from app.analytics import router as analytics_router

# ✅ import AI router
from app.ai import router as ai_router

app = FastAPI()

# ✅ CORS (frontend needs this)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ existing routes (these match your Swagger)
app.include_router(auth_router)
app.include_router(project_router)
app.include_router(admin_router)
app.include_router(logs_router)
app.include_router(analytics_router)

# 🚀 NEW AI route
app.include_router(ai_router)


@app.get("/")
def root():
    return {"message": "Epoxy Backend Running"}
