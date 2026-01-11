import uuid

import httpx
import pytest

from config import load_config

# Load configuration (env vars > config.toml > defaults)
_config = load_config()
JIRA_URL = _config.url
JIRA_EMAIL = _config.email
JIRA_PASSWORD = _config.token
JIRA_PROJECT_KEY = _config.project_key
JIRA_API_VERSION = _config.api_version

# Setup auth headers for basic auth (used by real JIRA, and ignored/accepted by mock)
AUTH = (JIRA_EMAIL, JIRA_PASSWORD)


@pytest.fixture
def client():
    with httpx.Client(base_url=JIRA_URL, auth=AUTH, timeout=10.0) as client:
        yield client


def make_adf_description(text):
    """Convert plain text to Atlassian Document Format for API v3."""
    return {
        "type": "doc",
        "version": 1,
        "content": [{"type": "paragraph", "content": [{"type": "text", "text": text}]}],
    }


def create_test_issue(client):
    """Helper to create a test issue and return its key."""
    description_text = "This is a test issue created by the automated test script."

    issue_data = {
        "fields": {
            "project": {"key": JIRA_PROJECT_KEY},
            "summary": f"Test Issue {uuid.uuid4()}",
            "issuetype": {"name": "Task"},
        }
    }

    # API v3 requires Atlassian Document Format for description
    if JIRA_API_VERSION == "3":
        issue_data["fields"]["description"] = make_adf_description(description_text)
    else:
        issue_data["fields"]["description"] = description_text

    response = client.post(f"/rest/api/{JIRA_API_VERSION}/issue", json=issue_data)
    assert response.status_code == 201 or response.status_code == 200

    data = response.json()
    assert "key" in data
    assert "id" in data

    return data["key"]


def test_create_issue(client):
    key = create_test_issue(client)
    assert key is not None


def test_get_issue(client):
    key = create_test_issue(client)

    response = client.get(f"/rest/api/{JIRA_API_VERSION}/issue/{key}")
    assert response.status_code == 200

    data = response.json()
    assert data["key"] == key
    assert "fields" in data
    assert "summary" in data["fields"]


def test_update_issue(client):
    key = create_test_issue(client)
    new_description_text = f"Updated description {uuid.uuid4()}"

    update_data = {"fields": {}}

    # API v3 requires Atlassian Document Format for description
    if JIRA_API_VERSION == "3":
        update_data["fields"]["description"] = make_adf_description(
            new_description_text
        )
    else:
        update_data["fields"]["description"] = new_description_text

    response = client.put(f"/rest/api/{JIRA_API_VERSION}/issue/{key}", json=update_data)
    assert response.status_code == 204

    # Verify update
    response = client.get(f"/rest/api/{JIRA_API_VERSION}/issue/{key}")
    data = response.json()
    # For v3, description is ADF object; check text content within
    if JIRA_API_VERSION == "3":
        desc_content = data["fields"]["description"]["content"][0]["content"][0]["text"]
        assert desc_content == new_description_text
    else:
        assert data["fields"]["description"] == new_description_text


def test_add_comment(client):
    key = create_test_issue(client)
    comment_text = f"Test comment {uuid.uuid4()}"

    # API v3 requires Atlassian Document Format for comment body
    if JIRA_API_VERSION == "3":
        comment_data = {"body": make_adf_description(comment_text)}
    else:
        comment_data = {"body": comment_text}

    response = client.post(
        f"/rest/api/{JIRA_API_VERSION}/issue/{key}/comment", json=comment_data
    )
    assert response.status_code == 201 or response.status_code == 200

    data = response.json()
    # For v3, body is ADF object; check text content within
    if JIRA_API_VERSION == "3":
        body_content = data["body"]["content"][0]["content"][0]["text"]
        assert body_content == comment_text
    else:
        assert data["body"] == comment_text


def test_transition_issue(client):
    # This test is tricky on real JIRA because transitions depend on workflow state.
    # For mock, we know the transitions.
    key = create_test_issue(client)

    # Get available transitions first
    response = client.get(f"/rest/api/{JIRA_API_VERSION}/issue/{key}/transitions")
    assert response.status_code == 200
    transitions = response.json()["transitions"]

    if not transitions:
        pytest.skip("No transitions available")

    transition_id = transitions[0]["id"]

    transition_data = {"transition": {"id": transition_id}}

    response = client.post(
        f"/rest/api/{JIRA_API_VERSION}/issue/{key}/transitions", json=transition_data
    )
    assert response.status_code == 204

    # Verify status change (if we knew what status it mapped to, but for now just success of call)
