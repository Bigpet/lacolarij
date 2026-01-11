"""Tests for ConnectionRepository."""

import pytest

from app.core.security import encrypt_api_token, hash_password
from app.db.repositories import ConnectionRepository


class TestConnectionRepository:
    """Tests for ConnectionRepository database operations."""

    @pytest.mark.asyncio
    async def test_create_connection(
        self, connection_repository: ConnectionRepository, test_user
    ):
        """Test creating a new connection."""
        api_token_encrypted = encrypt_api_token("test-api-token")

        connection = await connection_repository.create(
            user_id=test_user.id,
            name="Test JIRA",
            jira_url="https://test.atlassian.net",
            email="test@example.com",
            api_token_encrypted=api_token_encrypted,
            api_version=3,
            is_default=False,
        )

        assert connection.id is not None
        assert connection.name == "Test JIRA"
        assert connection.jira_url == "https://test.atlassian.net"
        assert connection.email == "test@example.com"
        assert connection.api_version == 3
        assert connection.is_default is False
        assert connection.created_at is not None

    @pytest.mark.asyncio
    async def test_create_connection_with_defaults(
        self, connection_repository: ConnectionRepository, test_user
    ):
        """Test creating a connection with default values."""
        api_token_encrypted = encrypt_api_token("test-api-token")

        connection = await connection_repository.create(
            user_id=test_user.id,
            name="Test JIRA",
            jira_url="https://test.atlassian.net",
            email="test@example.com",
            api_token_encrypted=api_token_encrypted,
        )

        assert connection.api_version == 3  # Default
        assert connection.is_default is False  # Default

    @pytest.mark.asyncio
    async def test_get_by_id_with_existing_connection(
        self, connection_repository: ConnectionRepository, test_user
    ):
        """Test getting a connection by existing ID."""
        api_token_encrypted = encrypt_api_token("test-api-token")
        created = await connection_repository.create(
            user_id=test_user.id,
            name="Test JIRA",
            jira_url="https://test.atlassian.net",
            email="test@example.com",
            api_token_encrypted=api_token_encrypted,
        )

        found = await connection_repository.get_by_id(created.id)

        assert found is not None
        assert found.id == created.id
        assert found.name == "Test JIRA"

    @pytest.mark.asyncio
    async def test_get_by_id_with_nonexistent_id(
        self, connection_repository: ConnectionRepository
    ):
        """Test getting a connection by nonexistent ID."""
        found = await connection_repository.get_by_id("nonexistent-id")
        assert found is None

    @pytest.mark.asyncio
    async def test_get_by_user_id(
        self, connection_repository: ConnectionRepository, test_user
    ):
        """Test getting all connections for a user."""
        api_token_encrypted = encrypt_api_token("test-api-token")

        await connection_repository.create(
            user_id=test_user.id,
            name="Connection 1",
            jira_url="https://test1.atlassian.net",
            email="test1@example.com",
            api_token_encrypted=api_token_encrypted,
        )
        await connection_repository.create(
            user_id=test_user.id,
            name="Connection 2",
            jira_url="https://test2.atlassian.net",
            email="test2@example.com",
            api_token_encrypted=api_token_encrypted,
        )

        connections = await connection_repository.get_by_user_id(test_user.id)

        assert len(connections) == 2
        names = {c.name for c in connections}
        assert names == {"Connection 1", "Connection 2"}

    @pytest.mark.asyncio
    async def test_get_by_user_id_returns_empty_for_no_connections(
        self, connection_repository: ConnectionRepository, test_user
    ):
        """Test that get_by_user_id returns empty list when user has no connections."""
        connections = await connection_repository.get_by_user_id(test_user.id)
        assert connections == []

    @pytest.mark.asyncio
    async def test_get_by_user_id_filters_by_user(
        self, connection_repository: ConnectionRepository, test_user, user_repository
    ):
        """Test that get_by_user_id only returns connections for the specified user."""
        api_token_encrypted = encrypt_api_token("test-api-token")

        # Create another user
        other_user = await user_repository.create("otheruser", hash_password("pass"))

        # Create connections for both users
        await connection_repository.create(
            user_id=test_user.id,
            name="User 1 Connection",
            jira_url="https://test1.atlassian.net",
            email="test1@example.com",
            api_token_encrypted=api_token_encrypted,
        )
        await connection_repository.create(
            user_id=other_user.id,
            name="User 2 Connection",
            jira_url="https://test2.atlassian.net",
            email="test2@example.com",
            api_token_encrypted=api_token_encrypted,
        )

        # Get connections for test_user
        connections = await connection_repository.get_by_user_id(test_user.id)

        assert len(connections) == 1
        assert connections[0].name == "User 1 Connection"

    @pytest.mark.asyncio
    async def test_update_connection(
        self, connection_repository: ConnectionRepository, test_user
    ):
        """Test updating a connection."""
        api_token_encrypted = encrypt_api_token("test-api-token")
        connection = await connection_repository.create(
            user_id=test_user.id,
            name="Old Name",
            jira_url="https://old.atlassian.net",
            email="old@example.com",
            api_token_encrypted=api_token_encrypted,
        )

        updated = await connection_repository.update(
            connection,
            name="New Name",
            jira_url="https://new.atlassian.net",
            email="new@example.com",
        )

        assert updated.name == "New Name"
        assert updated.jira_url == "https://new.atlassian.net"
        assert updated.email == "new@example.com"

    @pytest.mark.asyncio
    async def test_update_connection_with_none_values(
        self, connection_repository: ConnectionRepository, test_user
    ):
        """Test that update ignores None values."""
        api_token_encrypted = encrypt_api_token("test-api-token")
        connection = await connection_repository.create(
            user_id=test_user.id,
            name="Original Name",
            jira_url="https://test.atlassian.net",
            email="test@example.com",
            api_token_encrypted=api_token_encrypted,
        )

        updated = await connection_repository.update(
            connection,
            name="New Name",
            jira_url=None,  # Should be ignored
            email=None,  # Should be ignored
        )

        assert updated.name == "New Name"
        assert updated.jira_url == "https://test.atlassian.net"  # Unchanged
        assert updated.email == "test@example.com"  # Unchanged

    @pytest.mark.asyncio
    async def test_delete_connection(
        self, connection_repository: ConnectionRepository, test_user
    ):
        """Test deleting a connection."""
        api_token_encrypted = encrypt_api_token("test-api-token")
        connection = await connection_repository.create(
            user_id=test_user.id,
            name="Test Connection",
            jira_url="https://test.atlassian.net",
            email="test@example.com",
            api_token_encrypted=api_token_encrypted,
        )

        # Verify connection exists
        found = await connection_repository.get_by_id(connection.id)
        assert found is not None

        # Delete connection
        await connection_repository.delete(connection)

        # Verify connection is deleted
        found = await connection_repository.get_by_id(connection.id)
        assert found is None

    @pytest.mark.asyncio
    async def test_clear_default(
        self, connection_repository: ConnectionRepository, test_user
    ):
        """Test clearing default flag for all user connections."""
        api_token_encrypted = encrypt_api_token("test-api-token")

        # Create multiple connections with is_default=True
        conn1 = await connection_repository.create(
            user_id=test_user.id,
            name="Connection 1",
            jira_url="https://test1.atlassian.net",
            email="test1@example.com",
            api_token_encrypted=api_token_encrypted,
            is_default=True,
        )
        conn2 = await connection_repository.create(
            user_id=test_user.id,
            name="Connection 2",
            jira_url="https://test2.atlassian.net",
            email="test2@example.com",
            api_token_encrypted=api_token_encrypted,
            is_default=True,
        )

        # Clear defaults
        await connection_repository.clear_default(test_user.id)

        # Verify both are cleared
        connections = await connection_repository.get_by_user_id(test_user.id)
        assert all(c.is_default is False for c in connections)

    @pytest.mark.asyncio
    async def test_clear_default_only_affects_specified_user(
        self, connection_repository: ConnectionRepository, test_user, user_repository
    ):
        """Test that clear_default only affects connections for the specified user."""
        api_token_encrypted = encrypt_api_token("test-api-token")

        # Create another user
        other_user = await user_repository.create("otheruser", hash_password("pass"))

        # Create connections for both users with is_default=True
        await connection_repository.create(
            user_id=test_user.id,
            name="User 1 Connection",
            jira_url="https://test1.atlassian.net",
            email="test1@example.com",
            api_token_encrypted=api_token_encrypted,
            is_default=True,
        )
        await connection_repository.create(
            user_id=other_user.id,
            name="User 2 Connection",
            jira_url="https://test2.atlassian.net",
            email="test2@example.com",
            api_token_encrypted=api_token_encrypted,
            is_default=True,
        )

        # Clear defaults for test_user only
        await connection_repository.clear_default(test_user.id)

        # Verify test_user's connections are cleared
        test_user_connections = await connection_repository.get_by_user_id(test_user.id)
        assert all(c.is_default is False for c in test_user_connections)

        # Verify other_user's connections are unchanged
        other_user_connections = await connection_repository.get_by_user_id(other_user.id)
        assert all(c.is_default is True for c in other_user_connections)

    @pytest.mark.asyncio
    async def test_multiple_connections_have_unique_ids(
        self, connection_repository: ConnectionRepository, test_user
    ):
        """Test that multiple connections have unique IDs."""
        api_token_encrypted = encrypt_api_token("test-api-token")

        conn1 = await connection_repository.create(
            user_id=test_user.id,
            name="Connection 1",
            jira_url="https://test1.atlassian.net",
            email="test1@example.com",
            api_token_encrypted=api_token_encrypted,
        )
        conn2 = await connection_repository.create(
            user_id=test_user.id,
            name="Connection 2",
            jira_url="https://test2.atlassian.net",
            email="test2@example.com",
            api_token_encrypted=api_token_encrypted,
        )

        assert conn1.id != conn2.id

    @pytest.mark.asyncio
    async def test_api_token_encryption_is_preserved(
        self, connection_repository: ConnectionRepository, test_user
    ):
        """Test that encrypted API token is stored and retrieved correctly."""
        original_token = "my-secret-api-token-12345"
        encrypted_token = encrypt_api_token(original_token)

        connection = await connection_repository.create(
            user_id=test_user.id,
            name="Test Connection",
            jira_url="https://test.atlassian.net",
            email="test@example.com",
            api_token_encrypted=encrypted_token,
        )

        found = await connection_repository.get_by_id(connection.id)
        assert found.api_token_encrypted == encrypted_token
