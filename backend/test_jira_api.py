import os
import pytest
import httpx
import uuid

# Configuration
JIRA_URL = os.environ.get("JIRA_URL", "http://localhost:8000")
JIRA_EMAIL = os.environ.get("JIRA_EMAIL", "dummy@example.com")
JIRA_PASSWORD = os.environ.get("JIRA_PASSWORD", "dummy_token")
JIRA_PROJECT_KEY = os.environ.get("JIRA_PROJECT_KEY", "TEST")

# Setup auth headers for basic auth (used by real JIRA, and ignored/accepted by mock)
AUTH = (JIRA_EMAIL, JIRA_PASSWORD)
JIRA_API_VERSION = os.environ.get("JIRA_API_VERSION", "3")

@pytest.fixture
def client():
    with httpx.Client(base_url=JIRA_URL, auth=AUTH, timeout=10.0) as client:
        yield client

def test_create_issue(client):
    issue_data = {
        "fields": {
            "project": {"key": JIRA_PROJECT_KEY},
            "summary": f"Test Issue {uuid.uuid4()}",
            "description": "This is a test issue created by the automated test script.",
            "issuetype": {"name": "Task"}
        }
    }
    if JIRA_URL != "http://localhost:8000":
         # Adjust project key and issuetype for real JIRA if needed
         # This is a placeholder, might need env vars for valid project/type
         pass 
         
    response = client.post(f"/rest/api/{JIRA_API_VERSION}/issue", json=issue_data)
    assert response.status_code == 201 or response.status_code == 200 # 201 Created is standard, but mock might return 200
    
    data = response.json()
    assert "key" in data
    assert "id" in data
    
    return data["key"]

def test_get_issue(client):
    key = test_create_issue(client)
    
    response = client.get(f"/rest/api/{JIRA_API_VERSION}/issue/{key}")
    assert response.status_code == 200
    
    data = response.json()
    assert data["key"] == key
    assert "fields" in data
    assert "summary" in data["fields"]

def test_update_issue(client):
    key = test_create_issue(client)
    new_description = f"Updated description {uuid.uuid4()}"
    
    update_data = {
        "fields": {
            "description": new_description
        }
    }
    
    response = client.put(f"/rest/api/{JIRA_API_VERSION}/issue/{key}", json=update_data)
    assert response.status_code == 204
    
    # Verify update
    response = client.get(f"/rest/api/{JIRA_API_VERSION}/issue/{key}")
    data = response.json()
    assert data["fields"]["description"] == new_description

def test_add_comment(client):
    key = test_create_issue(client)
    comment_body = f"Test comment {uuid.uuid4()}"
    
    comment_data = {
        "body": comment_body
    }
    
    response = client.post(f"/rest/api/{JIRA_API_VERSION}/issue/{key}/comment", json=comment_data)
    assert response.status_code == 201 or response.status_code == 200
    
    data = response.json()
    assert data["body"] == comment_body

def test_transition_issue(client):
    # This test is tricky on real JIRA because transitions depend on workflow state.
    # For mock, we know the transitions.
    key = test_create_issue(client)
    
    # Get available transitions first
    response = client.get(f"/rest/api/{JIRA_API_VERSION}/issue/{key}/transitions")
    assert response.status_code == 200
    transitions = response.json()["transitions"]
    
    if not transitions:
        pytest.skip("No transitions available")
        
    transition_id = transitions[0]["id"]
    
    transition_data = {
        "transition": {
            "id": transition_id
        }
    }
    
    response = client.post(f"/rest/api/{JIRA_API_VERSION}/issue/{key}/transitions", json=transition_data)
    assert response.status_code == 204
    
    # Verify status change (if we knew what status it mapped to, but for now just success of call)
