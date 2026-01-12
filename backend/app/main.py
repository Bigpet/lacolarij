"""FastAPI application factory."""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.config import get_settings
from app.db.database import close_db, init_db
from app.db.repositories import ConnectionRepository, UserRepository
from app.services.demo_init import initialize_demo_data
from app.services.mock_jira import mock_jira_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    await init_db()

    # Initialize demo data
    from app.db.database import get_session

    async for session in get_session():
        user_repo = UserRepository(session)
        conn_repo = ConnectionRepository(session)
        await initialize_demo_data(user_repo, conn_repo)
        break

    yield
    # Shutdown
    await close_db()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title="JiraLocal API",
        description="Local-first JIRA client backend",
        version="0.1.0",
        lifespan=lifespan,
        debug=settings.debug,
    )

    # CORS middleware - default origins for development
    cors_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost",
        "http://127.0.0.1",
    ]
    # Allow additional origins from CORS_ORIGINS environment variable (comma-separated)
    extra_origins = os.getenv("CORS_ORIGINS", "").split(",")
    cors_origins.extend([o.strip() for o in extra_origins if o.strip()])

    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include mock JIRA routes at /api/jira/mock
    # IMPORTANT: Must be included BEFORE api_router so it takes precedence
    # over the relay router's /{connection_id}/... pattern
    app.include_router(mock_jira_router, prefix="/api/jira/mock")

    # Include API routes
    app.include_router(api_router)

    # Include test routes only in test environment
    if os.getenv("JIRALOCAL_ENV") == "test":
        from app.api.test import router as test_router

        app.include_router(test_router)

    # Health check endpoint
    @app.get("/health")
    async def health_check():
        return {"status": "healthy"}

    return app


# Create the app instance
app = create_app()


if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
