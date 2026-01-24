"""Database configuration and session management."""

from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""

    pass


# Create async engine
engine = create_async_engine(
    get_settings().get_database_url(),
    echo=False,
    future=True,
)


# Enable foreign keys for SQLite only (PostgreSQL has them enabled by default)
@event.listens_for(engine.sync_engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Enable foreign keys for SQLite connections."""
    settings = get_settings()
    if settings.database_type == "sqlite":
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


# Session factory
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_session() -> AsyncSession:
    """Dependency for getting database sessions."""
    async with async_session_factory() as session:
        yield session


async def init_db() -> None:
    """Initialize database tables and run schema migrations."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Run simple schema migrations for SQLite
        await conn.run_sync(_run_migrations)


def _run_migrations(conn) -> None:
    """Run simple schema migrations to add missing columns.

    This is a lightweight migration system for SQLite that adds columns
    that may be missing from older database versions.
    """
    from sqlalchemy import inspect, text
    from sqlalchemy.exc import OperationalError

    settings = get_settings()
    if settings.database_type != "sqlite":
        return

    inspector = inspect(conn)

    # Migration: Add is_locked column to jira_connections if missing
    if "jira_connections" in inspector.get_table_names():
        columns = [col["name"] for col in inspector.get_columns("jira_connections")]
        if "is_locked" not in columns:
            try:
                conn.execute(
                    text(
                        "ALTER TABLE jira_connections ADD COLUMN is_locked BOOLEAN DEFAULT 0"
                    )
                )
                # Log to stdout since logger may not be configured yet
                print("Migration: Added is_locked column to jira_connections")
            except OperationalError:
                # Another worker already added the column - race condition handled
                pass


async def close_db() -> None:
    """Close database connections."""
    await engine.dispose()
