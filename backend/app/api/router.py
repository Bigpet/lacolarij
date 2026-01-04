"""Main API router aggregating all routes."""

from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.users import router as users_router

# Main API router
api_router = APIRouter(prefix="/api")

# Include sub-routers
api_router.include_router(auth_router)
api_router.include_router(users_router)
