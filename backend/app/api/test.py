"""Test-only endpoints for controlling mock JIRA during E2E tests.

These endpoints are only available when JIRALOCAL_ENV=test.
"""

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.mock_jira.router import _issues, reset_storage, _now_iso
from app.services.mock_jira.models import DEFAULT_TRANSITIONS


router = APIRouter(prefix="/api/test", tags=["test"])


class TestIssueCreate(BaseModel):
    """Schema for creating a test issue directly in mock storage."""

    summary: str
    description: str | None = None
    status: str | None = None  # "To Do", "In Progress", "Done"
    assignee: str | None = None
    priority: str | None = None
    issue_type: str | None = None


class TestIssueUpdate(BaseModel):
    """Schema for simulating remote changes to an issue."""

    summary: str | None = None
    description: Any | None = None
    status: str | None = None
    assignee: str | None = None


@router.post("/mock-jira/reset")
async def reset_mock_jira() -> dict[str, str]:
    """Reset mock JIRA storage to clean state."""
    reset_storage()
    return {"status": "reset"}


@router.post("/mock-jira/issues")
async def create_test_issue(issue: TestIssueCreate) -> dict[str, str]:
    """Create an issue directly in mock JIRA storage.

    This bypasses the normal JIRA API to create test data quickly.
    """
    # Calculate next issue number
    seen_ids = set()
    for stored_issue in _issues.values():
        seen_ids.add(stored_issue["id"])
    next_num = len(seen_ids) + 1

    key = f"TEST-{next_num}"
    issue_id = str(next_num)
    now = _now_iso()

    # Determine status
    status_data = {
        "name": "To Do",
        "id": "1",
        "statusCategory": {
            "id": 2,
            "key": "new",
            "colorName": "blue-gray",
            "name": "To Do",
        },
    }

    if issue.status:
        for t in DEFAULT_TRANSITIONS:
            if t["name"].lower() == issue.status.lower():
                status_data = t["to"]
                break

    new_issue = {
        "id": issue_id,
        "key": key,
        "self": f"http://localhost:8000/rest/api/3/issue/{key}",
        "fields": {
            "summary": issue.summary,
            "description": issue.description,
            "issuetype": {"name": issue.issue_type or "Task"},
            "project": {"key": "TEST"},
            "status": status_data,
            "priority": {"name": issue.priority or "Medium"},
            "assignee": {"displayName": issue.assignee} if issue.assignee else None,
            "reporter": {"displayName": "Test User"},
            "labels": [],
            "created": now,
            "updated": now,
            "comment": {"comments": [], "total": 0},
        },
    }

    # Store by both key and ID for lookup flexibility
    _issues[key] = new_issue
    _issues[issue_id] = new_issue

    return {"key": key, "id": issue_id}


@router.patch("/mock-jira/issues/{issue_id_or_key}")
async def simulate_remote_change(
    issue_id_or_key: str, changes: TestIssueUpdate
) -> dict[str, str]:
    """Simulate a remote change to an issue (for conflict testing).

    This modifies the issue directly in storage without going through
    the normal update flow, simulating what would happen if another
    user edited the issue in JIRA.
    """
    if issue_id_or_key not in _issues:
        raise HTTPException(status_code=404, detail="Issue not found")

    issue = _issues[issue_id_or_key]

    if changes.summary is not None:
        issue["fields"]["summary"] = changes.summary

    if changes.description is not None:
        issue["fields"]["description"] = changes.description

    if changes.status is not None:
        for t in DEFAULT_TRANSITIONS:
            if t["name"].lower() == changes.status.lower():
                issue["fields"]["status"] = t["to"]
                break

    if changes.assignee is not None:
        issue["fields"]["assignee"] = {"displayName": changes.assignee}

    # Update timestamp to trigger conflict detection
    issue["fields"]["updated"] = _now_iso()

    return {"status": "updated"}


class TestCommentCreate(BaseModel):
    """Schema for creating a test comment."""

    body: str
    author: str = "Test User"


@router.post("/mock-jira/issues/{issue_id_or_key}/comments")
async def add_test_comment(
    issue_id_or_key: str,
    comment: TestCommentCreate,
) -> dict[str, str]:
    """Add a comment directly to an issue for testing."""
    import uuid

    if issue_id_or_key not in _issues:
        raise HTTPException(status_code=404, detail="Issue not found")

    issue = _issues[issue_id_or_key]
    now = _now_iso()

    comment_id = str(uuid.uuid4())
    new_comment = {
        "id": comment_id,
        "body": comment.body,
        "author": {"name": comment.author.lower().replace(" ", "_"), "displayName": comment.author},
        "created": now,
        "updated": now,
    }

    if "comment" not in issue["fields"]:
        issue["fields"]["comment"] = {"comments": [], "total": 0}

    issue["fields"]["comment"]["comments"].append(new_comment)
    issue["fields"]["comment"]["total"] = len(issue["fields"]["comment"]["comments"])
    issue["fields"]["updated"] = now

    return {"id": comment_id}
