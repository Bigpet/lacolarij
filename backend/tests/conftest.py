"""Pytest configuration and fixtures for backend tests."""

import asyncio
from collections.abc import AsyncGenerator, Generator
from typing import Any
from unittest.mock import MagicMock

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.security import hash_password
from app.db.database import Base
from app.db.repositories import ConnectionRepository, UserRepository

# In-memory SQLite database for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def engine() -> AsyncGenerator[Any, None]:
    """Create in-memory SQLite engine for testing."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        future=True,
    )

    # Enable foreign keys for SQLite
    def enable_foreign_keys(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    from sqlalchemy import event

    event.listen(engine.sync_engine, "connect", enable_foreign_keys)

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    # Drop tables after test
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(engine: Any) -> AsyncGenerator[AsyncSession, None]:
    """Create a database session for testing."""
    async_session_factory = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with async_session_factory() as session:
        yield session


@pytest.fixture
def user_repository(db_session: AsyncSession) -> UserRepository:
    """Create a UserRepository instance."""
    return UserRepository(db_session)


@pytest.fixture
def connection_repository(db_session: AsyncSession) -> ConnectionRepository:
    """Create a ConnectionRepository instance."""
    return ConnectionRepository(db_session)


@pytest.fixture
def test_settings(monkeypatch: pytest.MonkeyPatch) -> None:
    """Configure test settings."""
    # Use a consistent secret key for testing
    monkeypatch.setenv("SECRET_KEY", "test-secret-key-for-jwt-tokens")
    monkeypatch.setenv("ENCRYPTION_KEY", "")  # Will be derived from secret_key
    monkeypatch.setenv("DATABASE_PATH", ":memory:")


@pytest_asyncio.fixture
async def test_user(user_repository: UserRepository) -> Any:
    """Create a test user."""
    password_hash = hash_password("testpassword123")
    user = await user_repository.create("testuser", password_hash)
    return user


@pytest.fixture
def mock_jira_router() -> MagicMock:
    """Mock the mock_jira router for testing."""
    from app.services.mock_jira import router

    mock_router = MagicMock()
    mock_router.routes = router.routes
    return mock_router
