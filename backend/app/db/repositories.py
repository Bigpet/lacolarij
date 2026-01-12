"""Database repositories for User and JiraConnection."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.connection import JiraConnection
from app.models.user import User


class UserRepository:
    """Repository for User database operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, username: str, password_hash: str) -> User:
        """Create a new user."""
        user = User(username=username, password_hash=password_hash)
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def get_by_id(self, user_id: str) -> User | None:
        """Get a user by ID."""
        result = await self.session.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> User | None:
        """Get a user by username."""
        result = await self.session.execute(
            select(User).where(User.username == username)
        )
        return result.scalar_one_or_none()

    async def delete(self, user: User) -> None:
        """Delete a user."""
        await self.session.delete(user)
        await self.session.commit()


class ConnectionRepository:
    """Repository for JiraConnection database operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self,
        user_id: str,
        name: str,
        jira_url: str,
        email: str,
        api_token_encrypted: str,
        api_version: int = 3,
        is_default: bool = False,
        is_locked: bool = False,
    ) -> JiraConnection:
        """Create a new JIRA connection."""
        connection = JiraConnection(
            user_id=user_id,
            name=name,
            jira_url=jira_url,
            email=email,
            api_token_encrypted=api_token_encrypted,
            api_version=api_version,
            is_default=is_default,
            is_locked=is_locked,
        )
        self.session.add(connection)
        await self.session.commit()
        await self.session.refresh(connection)
        return connection

    async def get_by_id(self, connection_id: str) -> JiraConnection | None:
        """Get a connection by ID."""
        result = await self.session.execute(
            select(JiraConnection).where(JiraConnection.id == connection_id)
        )
        return result.scalar_one_or_none()

    async def get_by_user_id(self, user_id: str) -> list[JiraConnection]:
        """Get all connections for a user."""
        result = await self.session.execute(
            select(JiraConnection).where(JiraConnection.user_id == user_id)
        )
        return list(result.scalars().all())

    async def update(self, connection: JiraConnection, **kwargs) -> JiraConnection:
        """Update a connection."""
        for key, value in kwargs.items():
            if value is not None and hasattr(connection, key):
                setattr(connection, key, value)
        await self.session.commit()
        await self.session.refresh(connection)
        return connection

    async def delete(self, connection: JiraConnection) -> None:
        """Delete a connection."""
        await self.session.delete(connection)
        await self.session.commit()

    async def clear_default(self, user_id: str) -> None:
        """Clear the default flag for all user's connections."""
        connections = await self.get_by_user_id(user_id)
        for conn in connections:
            conn.is_default = False
        await self.session.commit()
