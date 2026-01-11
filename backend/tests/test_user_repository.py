"""Tests for UserRepository."""

import pytest

from app.core.security import hash_password
from app.db.repositories import UserRepository
from app.models.user import User


class TestUserRepository:
    """Tests for UserRepository database operations."""

    @pytest.mark.asyncio
    async def test_create_user(self, user_repository: UserRepository):
        """Test creating a new user."""
        username = "testuser"
        password_hash = hash_password("password123")

        user = await user_repository.create(username, password_hash)

        assert user.id is not None
        assert user.username == username
        assert user.password_hash == password_hash
        assert user.created_at is not None

    @pytest.mark.asyncio
    async def test_create_user_returns_user_object(
        self, user_repository: UserRepository
    ):
        """Test that create returns a User object."""
        user = await user_repository.create("alice", hash_password("pass"))

        assert isinstance(user, User)
        assert hasattr(user, "id")
        assert hasattr(user, "username")
        assert hasattr(user, "password_hash")
        assert hasattr(user, "created_at")

    @pytest.mark.asyncio
    async def test_create_user_populates_id(self, user_repository: UserRepository):
        """Test that create populates the user ID."""
        user = await user_repository.create("bob", hash_password("pass"))

        assert user.id is not None
        assert len(user.id) > 0

    @pytest.mark.asyncio
    async def test_get_by_id_with_existing_user(self, user_repository: UserRepository):
        """Test getting a user by existing ID."""
        created_user = await user_repository.create("charlie", hash_password("pass"))

        found_user = await user_repository.get_by_id(created_user.id)

        assert found_user is not None
        assert found_user.id == created_user.id
        assert found_user.username == "charlie"

    @pytest.mark.asyncio
    async def test_get_by_id_with_nonexistent_id(self, user_repository: UserRepository):
        """Test getting a user by nonexistent ID."""
        found_user = await user_repository.get_by_id("nonexistent-id")

        assert found_user is None

    @pytest.mark.asyncio
    async def test_get_by_username_with_existing_user(
        self, user_repository: UserRepository
    ):
        """Test getting a user by existing username."""
        username = "david"
        await user_repository.create(username, hash_password("pass"))

        found_user = await user_repository.get_by_username(username)

        assert found_user is not None
        assert found_user.username == username

    @pytest.mark.asyncio
    async def test_get_by_username_with_nonexistent_username(
        self, user_repository: UserRepository
    ):
        """Test getting a user by nonexistent username."""
        found_user = await user_repository.get_by_username("nonexistent-user")

        assert found_user is None

    @pytest.mark.asyncio
    async def test_get_by_username_is_case_sensitive(
        self, user_repository: UserRepository
    ):
        """Test that username lookup is case sensitive."""
        username = "Eve"
        await user_repository.create(username, hash_password("pass"))

        found_user = await user_repository.get_by_username("eve")
        assert found_user is None

        found_user = await user_repository.get_by_username("Eve")
        assert found_user is not None

    @pytest.mark.asyncio
    async def test_delete_user(self, user_repository: UserRepository):
        """Test deleting a user."""
        user = await user_repository.create("frank", hash_password("pass"))

        # Verify user exists
        found = await user_repository.get_by_id(user.id)
        assert found is not None

        # Delete user
        await user_repository.delete(user)

        # Verify user is deleted
        found = await user_repository.get_by_id(user.id)
        assert found is None

    @pytest.mark.asyncio
    async def test_delete_nonexistent_user_raises(
        self, user_repository: UserRepository
    ):
        """Test that deleting a non-persisted user raises an error."""
        from sqlalchemy.exc import InvalidRequestError

        user = User(id="fake-id", username="fake", password_hash="fake")
        # SQLAlchemy raises InvalidRequestError for non-persisted objects
        with pytest.raises(InvalidRequestError):
            await user_repository.delete(user)

    @pytest.mark.asyncio
    async def test_multiple_users_have_unique_ids(
        self, user_repository: UserRepository
    ):
        """Test that multiple users have unique IDs."""
        user1 = await user_repository.create("user1", hash_password("pass1"))
        user2 = await user_repository.create("user2", hash_password("pass2"))

        assert user1.id != user2.id

    @pytest.mark.asyncio
    async def test_create_multiple_users(self, user_repository: UserRepository):
        """Test creating multiple users."""
        users = [
            await user_repository.create("alice", hash_password("pass1")),
            await user_repository.create("bob", hash_password("pass2")),
            await user_repository.create("charlie", hash_password("pass3")),
        ]

        assert len(users) == 3
        assert len(set(u.username for u in users)) == 3
        assert len(set(u.id for u in users)) == 3

    @pytest.mark.asyncio
    async def test_get_by_id_after_multiple_creates(
        self, user_repository: UserRepository
    ):
        """Test getting users after creating multiple."""
        user1 = await user_repository.create("user1", hash_password("pass1"))
        user2 = await user_repository.create("user2", hash_password("pass2"))

        found1 = await user_repository.get_by_id(user1.id)
        found2 = await user_repository.get_by_id(user2.id)

        assert found1.username == "user1"
        assert found2.username == "user2"

    @pytest.mark.asyncio
    async def test_username_uniqueness_enforced(self, user_repository: UserRepository):
        """Test that username uniqueness is enforced at database level."""
        await user_repository.create("duplicate", hash_password("pass1"))

        # Creating a second user with the same username should fail
        # This tests the database constraint
        with pytest.raises(Exception):  # SQLAlchemy will raise an IntegrityError
            await user_repository.create("duplicate", hash_password("pass2"))

    @pytest.mark.asyncio
    async def test_created_at_is_set_automatically(
        self, user_repository: UserRepository
    ):
        """Test that created_at is set automatically on creation."""
        from datetime import datetime, timezone

        user = await user_repository.create("grace", hash_password("pass"))

        assert user.created_at is not None
        # Verify created_at is a datetime object
        assert isinstance(user.created_at, datetime)
        # Check it's a recent time (within last minute)
        # Note: SQLite stores datetimes as naive, so we compare with naive datetime
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        user_created_naive = (
            user.created_at.replace(tzinfo=None)
            if user.created_at.tzinfo
            else user.created_at
        )
        assert (now - user_created_naive).total_seconds() < 60

    @pytest.mark.asyncio
    async def test_password_hash_is_stored_correctly(
        self, user_repository: UserRepository
    ):
        """Test that password hash is stored correctly."""
        password_hash = "$argon2id$v=19$m=65536,t=3,p=4$salt$hash"
        user = await user_repository.create("henry", password_hash)

        assert user.password_hash == password_hash

        found = await user_repository.get_by_username("henry")
        assert found.password_hash == password_hash
