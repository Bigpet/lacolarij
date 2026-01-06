"""Tests for mock JIRA router."""

import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI

from app.services.mock_jira import mock_jira_router, reset_storage


@pytest.fixture
def app() -> FastAPI:
    """Create a test app with the mock JIRA router."""
    app = FastAPI()
    app.include_router(mock_jira_router)
    return app


@pytest.fixture
def client(app: FastAPI) -> TestClient:
    """Create a test client."""
    return TestClient(app)


@pytest.fixture(autouse=True)
def reset_mock_storage() -> None:
    """Reset mock storage before each test."""
    reset_storage()


class TestCreateIssue:
    """Tests for POST /rest/api/2/issue (and /3/issue)."""

    def test_create_issue_v2(self, client: TestClient):
        """Test creating an issue via API v2."""
        response = client.post(
            "/rest/api/2/issue",
            json={
                "fields": {
                    "summary": "Test issue",
                    "description": "Test description",
                    "issuetype": {"name": "Bug"},
                    "project": {"key": "TEST"},
                }
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["key"] == "TEST-1"
        assert data["fields"]["summary"] == "Test issue"
        assert data["fields"]["description"] == "Test description"
        assert data["fields"]["status"]["name"] == "To Do"

    def test_create_issue_v3(self, client: TestClient):
        """Test creating an issue via API v3."""
        response = client.post(
            "/rest/api/3/issue",
            json={
                "fields": {
                    "summary": "Test issue",
                    "description": {
                        "type": "doc",
                        "version": 1,
                        "content": [
                            {
                                "type": "paragraph",
                                "content": [{"type": "text", "text": "Test description"}],
                            }
                        ],
                    },
                    "issuetype": {"name": "Task"},
                }
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["key"] == "TEST-1"
        assert data["fields"]["summary"] == "Test issue"

    def test_create_issue_generates_incrementing_key(self, client: TestClient):
        """Test that issue keys increment."""
        client.post(
            "/rest/api/2/issue",
            json={"fields": {"summary": "Issue 1"}},
        )
        client.post(
            "/rest/api/2/issue",
            json={"fields": {"summary": "Issue 2"}},
        )

        response = client.post(
            "/rest/api/2/issue",
            json={"fields": {"summary": "Issue 3"}},
        )

        data = response.json()
        assert data["key"] == "TEST-3"

    def test_create_issue_generates_id(self, client: TestClient):
        """Test that issue IDs are generated."""
        response = client.post(
            "/rest/api/2/issue",
            json={"fields": {"summary": "Test issue"}},
        )

        data = response.json()
        assert data["id"] is not None
        assert len(data["id"]) > 0


class TestGetIssue:
    """Tests for GET /rest/api/2/issue/{id_or_key}."""

    def test_get_issue_by_key(self, client: TestClient):
        """Test getting an issue by key."""
        # Create an issue first
        create_response = client.post(
            "/rest/api/2/issue",
            json={"fields": {"summary": "Test issue"}},
        )
        issue_key = create_response.json()["key"]

        # Get the issue
        response = client.get(f"/rest/api/2/issue/{issue_key}")

        assert response.status_code == 200
        data = response.json()
        assert data["key"] == issue_key
        assert data["fields"]["summary"] == "Test issue"

    def test_get_issue_by_id(self, client: TestClient):
        """Test getting an issue by ID."""
        # Create an issue first
        create_response = client.post(
            "/rest/api/2/issue",
            json={"fields": {"summary": "Test issue"}},
        )
        issue_id = create_response.json()["id"]

        # Get the issue
        response = client.get(f"/rest/api/3/issue/{issue_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == issue_id

    def test_get_nonexistent_issue_returns_404(self, client: TestClient):
        """Test getting a nonexistent issue returns 404."""
        response = client.get("/rest/api/2/issue/NONEXISTENT-999")

        assert response.status_code == 404


class TestUpdateIssue:
    """Tests for PUT /rest/api/2/issue/{id_or_key}."""

    def test_update_issue_summary(self, client: TestClient):
        """Test updating issue summary."""
        # Create an issue first
        create_response = client.post(
            "/rest/api/2/issue",
            json={"fields": {"summary": "Original summary"}},
        )
        issue_key = create_response.json()["key"]

        # Update the issue
        response = client.put(
            f"/rest/api/2/issue/{issue_key}",
            json={"fields": {"summary": "Updated summary"}},
        )

        assert response.status_code == 204

        # Verify the update
        get_response = client.get(f"/rest/api/2/issue/{issue_key}")
        assert get_response.json()["fields"]["summary"] == "Updated summary"

    def test_update_issue_description(self, client: TestClient):
        """Test updating issue description."""
        # Create an issue first
        create_response = client.post(
            "/rest/api/2/issue",
            json={"fields": {"summary": "Test", "description": "Original description"}},
        )
        issue_key = create_response.json()["key"]

        # Update the issue
        response = client.put(
            f"/rest/api/2/issue/{issue_key}",
            json={"fields": {"description": "Updated description"}},
        )

        assert response.status_code == 204

        # Verify the update
        get_response = client.get(f"/rest/api/2/issue/{issue_key}")
        assert get_response.json()["fields"]["description"] == "Updated description"

    def test_update_nonexistent_issue_returns_404(self, client: TestClient):
        """Test updating a nonexistent issue returns 404."""
        response = client.put(
            "/rest/api/2/issue/NONEXISTENT-999",
            json={"fields": {"summary": "Updated"}},
        )

        assert response.status_code == 404


class TestTransitions:
    """Tests for issue transitions."""

    def test_get_transitions(self, client: TestClient):
        """Test getting available transitions."""
        # Create an issue first
        create_response = client.post(
            "/rest/api/2/issue",
            json={"fields": {"summary": "Test issue"}},
        )
        issue_key = create_response.json()["key"]

        # Get transitions
        response = client.get(f"/rest/api/2/issue/{issue_key}/transitions")

        assert response.status_code == 200
        data = response.json()
        assert "transitions" in data
        assert len(data["transitions"]) > 0

    def test_transition_issue(self, client: TestClient):
        """Test transitioning an issue."""
        # Create an issue first
        create_response = client.post(
            "/rest/api/2/issue",
            json={"fields": {"summary": "Test issue"}},
        )
        issue_key = create_response.json()["key"]

        # Transition the issue to "In Progress"
        response = client.post(
            f"/rest/api/3/issue/{issue_key}/transitions",
            json={"transition": {"id": "21"}},  # In Progress transition
        )

        assert response.status_code == 204

        # Verify the status changed
        get_response = client.get(f"/rest/api/2/issue/{issue_key}")
        assert get_response.json()["fields"]["status"]["name"] == "In Progress"

    def test_transition_to_done(self, client: TestClient):
        """Test transitioning an issue to Done."""
        # Create an issue first
        create_response = client.post(
            "/rest/api/2/issue",
            json={"fields": {"summary": "Test issue"}},
        )
        issue_key = create_response.json()["key"]

        # Transition to Done
        client.post(
            f"/rest/api/3/issue/{issue_key}/transitions",
            json={"transition": {"id": "31"}},
        )

        # Verify the status
        get_response = client.get(f"/rest/api/2/issue/{issue_key}")
        assert get_response.json()["fields"]["status"]["name"] == "Done"

    def test_transition_with_invalid_id_returns_400(self, client: TestClient):
        """Test transitioning with invalid transition ID returns 400."""
        # Create an issue first
        create_response = client.post(
            "/rest/api/2/issue",
            json={"fields": {"summary": "Test issue"}},
        )
        issue_key = create_response.json()["key"]

        # Try invalid transition
        response = client.post(
            f"/rest/api/3/issue/{issue_key}/transitions",
            json={"transition": {"id": "999"}},
        )

        assert response.status_code == 400


class TestComments:
    """Tests for issue comments."""

    def test_add_comment(self, client: TestClient):
        """Test adding a comment to an issue."""
        # Create an issue first
        create_response = client.post(
            "/rest/api/2/issue",
            json={"fields": {"summary": "Test issue"}},
        )
        issue_key = create_response.json()["key"]

        # Add a comment
        response = client.post(
            f"/rest/api/2/issue/{issue_key}/comment",
            json={"body": "This is a test comment"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["body"] == "This is a test comment"
        assert data["id"] is not None
        assert "author" in data

    def test_add_comment_v3_with_adf(self, client: TestClient):
        """Test adding a comment with ADF content via API v3."""
        # Create an issue first
        create_response = client.post(
            "/rest/api/2/issue",
            json={"fields": {"summary": "Test issue"}},
        )
        issue_key = create_response.json()["key"]

        # Add a comment with ADF
        response = client.post(
            f"/rest/api/3/issue/{issue_key}/comment",
            json={
                "body": {
                    "type": "doc",
                    "version": 1,
                    "content": [
                        {
                            "type": "paragraph",
                            "content": [{"type": "text", "text": "ADF comment"}],
                        }
                    ],
                }
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["body"]["type"] == "doc"

    def test_add_comment_to_nonexistent_issue_returns_404(self, client: TestClient):
        """Test adding a comment to nonexistent issue returns 404."""
        response = client.post(
            "/rest/api/2/issue/NONEXISTENT-999/comment",
            json={"body": "Test comment"},
        )

        assert response.status_code == 404


class TestSearch:
    """Tests for issue search (JQL)."""

    def test_search_returns_all_issues(self, client: TestClient):
        """Test that search returns all issues."""
        # Create some issues
        client.post("/rest/api/2/issue", json={"fields": {"summary": "Issue 1"}})
        client.post("/rest/api/2/issue", json={"fields": {"summary": "Issue 2"}})
        client.post("/rest/api/2/issue", json={"fields": {"summary": "Issue 3"}})

        # Search
        response = client.get("/rest/api/2/search/jql?jql=")

        assert response.status_code == 200
        data = response.json()
        assert "issues" in data
        assert data["total"] == 3
        assert len(data["issues"]) == 3

    def test_search_with_max_results(self, client: TestClient):
        """Test search with maxResults parameter."""
        # Create multiple issues
        for i in range(5):
            client.post("/rest/api/2/issue", json={"fields": {"summary": f"Issue {i}"}})

        # Search with maxResults=2
        response = client.get("/rest/api/2/search/jql?jql=&maxResults=2")

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 5
        assert data["maxResults"] == 2
        assert len(data["issues"]) == 2

    def test_search_order_by_descending(self, client: TestClient):
        """Test search with ORDER BY updated DESC."""
        # Create issues
        client.post("/rest/api/2/issue", json={"fields": {"summary": "First"}})
        client.post("/rest/api/2/issue", json={"fields": {"summary": "Second"}})

        # Search with ORDER BY
        response = client.get("/rest/api/2/search/jql?jql=order+by+updated+desc")

        assert response.status_code == 200
        data = response.json()
        # Should return both issues
        assert data["total"] == 2
        assert len(data["issues"]) == 2
        # Verify the search parsed the JQL (would have different behavior without ORDER BY)

    def test_search_order_by_ascending(self, client: TestClient):
        """Test search with ORDER BY updated ASC."""
        # Create issues
        client.post("/rest/api/2/issue", json={"fields": {"summary": "First"}})
        client.post("/rest/api/2/issue", json={"fields": {"summary": "Second"}})

        # Search with ORDER BY ASC
        response = client.get("/rest/api/2/search/jql?jql=order+by+updated+asc")

        assert response.status_code == 200
        data = response.json()
        # Should return both issues
        assert data["total"] == 2
        assert len(data["issues"]) == 2

    def test_search_empty_database(self, client: TestClient):
        """Test search when no issues exist."""
        response = client.get("/rest/api/2/search/jql?jql=")

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["issues"] == []


class TestResetStorage:
    """Tests for reset_storage function."""

    def test_reset_storage_clears_issues(self, client: TestClient):
        """Test that reset_storage clears all issues."""
        # Create an issue
        client.post("/rest/api/2/issue", json={"fields": {"summary": "Test issue"}})

        # Verify it exists
        response = client.get("/rest/api/2/search/jql?jql=")
        assert response.json()["total"] == 1

        # Reset storage
        reset_storage()

        # Verify storage is cleared
        response = client.get("/rest/api/2/search/jql?jql=")
        assert response.json()["total"] == 0
