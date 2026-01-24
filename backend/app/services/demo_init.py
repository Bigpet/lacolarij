"""Demo data initialization service.

This service initializes demo user, connection, and seed data on app startup.
"""

import logging
from typing import Any

from app.core.security import encrypt_api_token, hash_password
from app.db.repositories import ConnectionRepository, UserRepository
from app.services.mock_jira.router import _issues

logger = logging.getLogger(__name__)

# Demo user credentials
DEMO_USERNAME = "demo_user"
DEMO_PASSWORD = "demo_password"
DEMO_EMAIL = "demo@example.com"


def _create_adf_text(text: str) -> dict[str, Any]:
    """Create ADF (Atlassian Document Format) text."""
    return {
        "version": 1,
        "type": "doc",
        "content": [
            {
                "type": "paragraph",
                "content": [{"type": "text", "text": text}],
            }
        ],
    }


def _seed_demo_issues() -> None:
    """Seed mock JIRA server with demo issues in various states."""
    demo_issues = [
        {
            "key": "DEMO-1",
            "id": "1",
            "self": "http://localhost:8000/rest/api/3/issue/DEMO-1",
            "fields": {
                "summary": "Setup development environment",
                "description": _create_adf_text(
                    "Install all necessary tools and dependencies for local "
                    "development."
                ),
                "issuetype": {"name": "Task", "id": "10001"},
                "project": {"key": "DEMO", "id": "10000", "name": "Demo Project"},
                "status": {
                    "name": "Done",
                    "id": "10002",
                    "statusCategory": {
                        "id": 3,
                        "key": "done",
                        "colorName": "green",
                        "name": "Done",
                    },
                },
                "priority": {"name": "High", "id": "2"},
                "assignee": {
                    "accountId": "demo-user",
                    "displayName": "Demo User",
                },
                "reporter": {"displayName": "Demo User"},
                "labels": ["setup", "onboarding"],
                "created": "2025-01-10T10:00:00.000Z",
                "updated": "2025-01-11T14:30:00.000Z",
                "comment": {"comments": [], "total": 0},
            },
        },
        {
            "key": "DEMO-2",
            "id": "2",
            "self": "http://localhost:8000/rest/api/3/issue/DEMO-2",
            "fields": {
                "summary": "Implement user authentication",
                "description": _create_adf_text(
                    "Add JWT-based authentication with login and registration "
                    "endpoints."
                ),
                "issuetype": {"name": "Story", "id": "10002"},
                "project": {"key": "DEMO", "id": "10000", "name": "Demo Project"},
                "status": {
                    "name": "In Progress",
                    "id": "3",
                    "statusCategory": {
                        "id": 4,
                        "key": "indeterminate",
                        "colorName": "yellow",
                        "name": "In Progress",
                    },
                },
                "priority": {"name": "High", "id": "2"},
                "assignee": {
                    "accountId": "demo-user",
                    "displayName": "Demo User",
                },
                "reporter": {"displayName": "Demo User"},
                "labels": ["backend", "security"],
                "created": "2025-01-10T11:00:00.000Z",
                "updated": "2025-01-12T09:15:00.000Z",
                "comment": {"comments": [], "total": 0},
            },
        },
        {
            "key": "DEMO-3",
            "id": "3",
            "self": "http://localhost:8000/rest/api/3/issue/DEMO-3",
            "fields": {
                "summary": "Design landing page mockup",
                "description": _create_adf_text(
                    "Create wireframes and high-fidelity mockups for the landing page."
                ),
                "issuetype": {"name": "Task", "id": "10001"},
                "project": {"key": "DEMO", "id": "10000", "name": "Demo Project"},
                "status": {
                    "name": "To Do",
                    "id": "1",
                    "statusCategory": {
                        "id": 2,
                        "key": "new",
                        "colorName": "blue-gray",
                        "name": "To Do",
                    },
                },
                "priority": {"name": "Medium", "id": "3"},
                "assignee": None,
                "reporter": {"displayName": "Demo User"},
                "labels": ["design", "frontend"],
                "created": "2025-01-11T08:00:00.000Z",
                "updated": "2025-01-11T08:00:00.000Z",
                "comment": {"comments": [], "total": 0},
            },
        },
        {
            "key": "DEMO-4",
            "id": "4",
            "self": "http://localhost:8000/rest/api/3/issue/DEMO-4",
            "fields": {
                "summary": "Fix responsive layout on mobile",
                "description": _create_adf_text(
                    "Navigation menu breaks on screens smaller than 768px. "
                    "Need to fix responsive breakpoints."
                ),
                "issuetype": {"name": "Bug", "id": "10003"},
                "project": {"key": "DEMO", "id": "10000", "name": "Demo Project"},
                "status": {
                    "name": "In Progress",
                    "id": "3",
                    "statusCategory": {
                        "id": 4,
                        "key": "indeterminate",
                        "colorName": "yellow",
                        "name": "In Progress",
                    },
                },
                "priority": {"name": "High", "id": "2"},
                "assignee": {
                    "accountId": "demo-user",
                    "displayName": "Demo User",
                },
                "reporter": {"displayName": "Product Owner"},
                "labels": ["bug", "frontend", "mobile"],
                "created": "2025-01-11T14:00:00.000Z",
                "updated": "2025-01-12T10:00:00.000Z",
                "comment": {"comments": [], "total": 0},
            },
        },
        {
            "key": "DEMO-5",
            "id": "5",
            "self": "http://localhost:8000/rest/api/3/issue/DEMO-5",
            "fields": {
                "summary": "Add unit tests for API endpoints",
                "description": _create_adf_text(
                    "Write comprehensive unit tests for all API endpoints to "
                    "ensure reliability."
                ),
                "issuetype": {"name": "Task", "id": "10001"},
                "project": {"key": "DEMO", "id": "10000", "name": "Demo Project"},
                "status": {
                    "name": "To Do",
                    "id": "1",
                    "statusCategory": {
                        "id": 2,
                        "key": "new",
                        "colorName": "blue-gray",
                        "name": "To Do",
                    },
                },
                "priority": {"name": "Medium", "id": "3"},
                "assignee": None,
                "reporter": {"displayName": "Demo User"},
                "labels": ["testing", "backend"],
                "created": "2025-01-12T09:00:00.000Z",
                "updated": "2025-01-12T09:00:00.000Z",
                "comment": {"comments": [], "total": 0},
            },
        },
        {
            "key": "DEMO-6",
            "id": "6",
            "self": "http://localhost:8000/rest/api/3/issue/DEMO-6",
            "fields": {
                "summary": "Update documentation with API examples",
                "description": _create_adf_text(
                    "Add code examples and usage guides to the API documentation."
                ),
                "issuetype": {"name": "Task", "id": "10001"},
                "project": {"key": "DEMO", "id": "10000", "name": "Demo Project"},
                "status": {
                    "name": "Done",
                    "id": "10002",
                    "statusCategory": {
                        "id": 3,
                        "key": "done",
                        "colorName": "green",
                        "name": "Done",
                    },
                },
                "priority": {"name": "Low", "id": "4"},
                "assignee": {
                    "accountId": "demo-user",
                    "displayName": "Demo User",
                },
                "reporter": {"displayName": "Demo User"},
                "labels": ["documentation"],
                "created": "2025-01-09T15:00:00.000Z",
                "updated": "2025-01-10T16:30:00.000Z",
                "comment": {"comments": [], "total": 0},
            },
        },
    ]

    # Clear existing issues and seed with demo data
    _issues.clear()
    for issue in demo_issues:
        key = issue["key"]
        issue_id = issue["id"]
        _issues[key] = issue
        _issues[issue_id] = issue

    logger.info(f"Seeded {len(demo_issues)} demo issues into mock JIRA")


async def initialize_demo_data(
    user_repo: UserRepository, conn_repo: ConnectionRepository
) -> None:
    """Initialize demo user, connection, and seed data.

    This is called on app startup to ensure demo environment is ready.
    Uses try/except for IntegrityError to handle race conditions when
    multiple workers start simultaneously.
    """
    from sqlalchemy.exc import IntegrityError

    # Get or create demo user
    demo_user = await user_repo.get_by_username(DEMO_USERNAME)

    if not demo_user:
        try:
            password_hash = hash_password(DEMO_PASSWORD)
            demo_user = await user_repo.create(
                username=DEMO_USERNAME, password_hash=password_hash
            )
            logger.info(f"Created demo user: {DEMO_USERNAME}")
        except IntegrityError:
            # Another worker created the user - rollback and fetch it
            await user_repo.session.rollback()
            demo_user = await user_repo.get_by_username(DEMO_USERNAME)
            logger.info(f"Demo user created by another worker: {DEMO_USERNAME}")
    else:
        logger.info(f"Demo user already exists: {DEMO_USERNAME}")

    # Check if demo connection already exists
    connections = await conn_repo.get_by_user_id(demo_user.id)
    demo_connection = next(
        (c for c in connections if c.jira_url == "demo://local"), None
    )

    if not demo_connection:
        try:
            # Create locked demo JIRA connection
            # Use a dummy encrypted token (mock server doesn't need real auth)
            encrypted_token = encrypt_api_token("demo-token")

            demo_connection = await conn_repo.create(
                user_id=demo_user.id,
                name="Demo JIRA",
                jira_url="demo://local",
                email=DEMO_EMAIL,
                api_token_encrypted=encrypted_token,
                api_version=3,
                is_default=True,
                is_locked=True,
            )
            logger.info("Created locked demo JIRA connection")
        except IntegrityError:
            # Another worker created the connection - rollback and continue
            await conn_repo.session.rollback()
            logger.info("Demo JIRA connection created by another worker")
    else:
        logger.info("Demo JIRA connection already exists")

    # Seed demo issues
    _seed_demo_issues()
