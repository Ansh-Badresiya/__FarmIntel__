from fastapi import APIRouter
from app.api.v1.endpoints import auth, farmer, officer, admin

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(farmer.router, prefix="/farmer", tags=["farmer"])
api_router.include_router(officer.router, prefix="/officer", tags=["officer"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
