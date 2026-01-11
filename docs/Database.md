# Database Layer Documentation

## Overview

The JiraLocal backend uses SQLAlchemy 2.0 with async support for database operations. The database layer is designed to be database-agnostic and supports both SQLite (default) and PostgreSQL.

## Supported Databases

| Database   | Driver    | Default | Use Case                     |
|------------|-----------|---------|------------------------------|
| SQLite     | aiosqlite | Yes     | Development, testing, small deployments |
| PostgreSQL | asyncpg   | No      | Production, multi-user environments |

## Configuration

### Environment Variables

Database configuration is managed through environment variables in `backend/.env`:

### Configuration Examples

**SQLite (default) - No configuration needed:**
```bash
# Application uses SQLite at backend/data/jiralocal.db by default
# SQLite settings (only used when DATABASE_TYPE=sqlite)
DATABASE_PATH=backend/data/jiralocal.db
```

**PostgreSQL:**
```bash
DATABASE_TYPE=postgresql
# Optional: Full database URL (overrides individual settings)
# DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/jiralocal
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=jiralocal
POSTGRES_PASSWORD=secure_password
POSTGRES_DATABASE=jiralocal
```

## Architecture

### File Structure

```
backend/app/
├── config.py              # Configuration with database URL construction
├── db/
│   ├── database.py        # Database engine, session management
│   └── repositories.py    # Repository pattern implementations
└── models/
    ├── user.py            # User model
    └── connection.py      # JIRA connection model
```

## Database Schema

### User Model

Located in `app/models/user.py`:

```python
class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationship to JIRA connections
    connections: Mapped[List["JiraConnection"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
```

### JiraConnection Model

Located in `app/models/connection.py`:

```python
class JiraConnection(Base):
    __tablename__ = "jira_connections"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    jira_url: Mapped[str] = mapped_column(String(500), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    api_token_encrypted: Mapped[str] = mapped_column(String(500), nullable=False)
    api_version: Mapped[Literal["v2", "v3"]] = mapped_column(String(10), default="v3")
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationship to User
    user: Mapped["User"] = relationship(back_populates="connections")
```

## Database-Specific Behavior

### SQLite

- **Default database** - No configuration required
- **File-based** - Stored at `backend/data/jiralocal.db`
- **Foreign keys** - Enabled via PRAGMA on connection
- **No connection pooling** - Uses `NullPool` (not needed for file-based DB)

### PostgreSQL

- **Production-ready** - Better for concurrent access
- **Server-based** - Requires separate PostgreSQL instance
- **Foreign keys** - Enabled by default
- **Connection pooling** - Uses `QueuePool` for efficiency

## Migrations

### Current Approach

The project currently uses SQLAlchemy's `Base.metadata.create_all()` for schema creation. This is suitable for:

- Simple schemas with minimal changes
- Single-instance deployments
- Development and testing environments

## Testing

### Test Database Configuration

Tests use an in-memory SQLite database for speed and isolation:

```python
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
```

### Running Tests

```bash
# Run all tests from backend directory
uv run pytest

# Run specific test file
uv run pytest tests/test_user_repository.py
```

### PostgreSQL Integration Tests

Optional PostgreSQL tests can be run by setting the `TEST_POSTGRES_URL` environment variable:

```bash
TEST_POSTGRES_URL="postgresql+asyncpg://user:pass@localhost:5432/test_db" uv run pytest
```

