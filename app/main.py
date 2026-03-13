from fastapi import FastAPI, Depends
from fastapi.security import OAuth2PasswordBearer
from app.routers import auth, wizard, admin
from app.security import oauth2_scheme

app = FastAPI(
    title="SaaS Backend",
    description="FastAPI SaaS backend with JWT authentication",
    version="1.0.0"
)

# Include routers
app.include_router(auth.router, tags=["auth"])
app.include_router(wizard.router, prefix="/wizard", tags=["wizard"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])

# Example root route with security (Swagger will prompt for token)
@app.get("/", summary="Root endpoint (requires token)")
def root(token: str = Depends(oauth2_scheme)):
    return {"message": "SaaS backend running", "token": token}
