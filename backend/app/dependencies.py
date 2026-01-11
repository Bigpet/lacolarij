"""FastAPI dependencies for dependency injection."""

from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AuthenticationError
from app.core.security import decode_access_token
from app.db.database import get_session
from app.db.repositories import ConnectionRepository, UserRepository
from app.models.user import User

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# Database session dependency
async def get_db_session() -> AsyncSession:
    """Get database session."""
    async for session in get_session():
        yield session


# Repository dependencies
async def get_user_repository(
    session: Annotated[AsyncSession, Depends(get_db_session)]
) -> UserRepository:
    """Get user repository."""
    return UserRepository(session)


async def get_connection_repository(
    session: Annotated[AsyncSession, Depends(get_db_session)]
) -> ConnectionRepository:
    """Get connection repository."""
    return ConnectionRepository(session)


# Current user dependency
async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    user_repo: Annotated[UserRepository, Depends(get_user_repository)],
) -> User:
    """Get the current authenticated user from JWT token."""
    payload = decode_access_token(token)
    if payload is None:
        raise AuthenticationError()

    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise AuthenticationError()

    user = await user_repo.get_by_id(user_id)
    if user is None:
        raise AuthenticationError()

    return user


# Type aliases for cleaner annotations
DbSession = Annotated[AsyncSession, Depends(get_db_session)]
UserRepo = Annotated[UserRepository, Depends(get_user_repository)]
ConnectionRepo = Annotated[ConnectionRepository, Depends(get_connection_repository)]
CurrentUser = Annotated[User, Depends(get_current_user)]
