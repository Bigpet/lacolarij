"""Mock JIRA server router for demo mode."""

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException, Response, Request

logger = logging.getLogger(__name__)


def _now_iso() -> str:
    """Generate ISO 8601 timestamp for JIRA compatibility."""
    return datetime.now(timezone.utc).isoformat(timespec='milliseconds')

from app.services.mock_jira.models import (
    IssueCreate,
    IssueUpdate,
    CommentCreate,
    TransitionRequest,
    DEFAULT_TRANSITIONS,
)

# Create router for mock JIRA endpoints
# This will be mounted at /api/jira/mock in the main app
router = APIRouter(tags=["mock-jira"])

# In-memory storage
_issues: dict[str, dict[str, Any]] = {}


def _get_issue(issue_id_or_key: str) -> dict[str, Any]:
    """Get an issue by ID or key, raising 404 if not found."""
    if issue_id_or_key not in _issues:
        raise HTTPException(status_code=404, detail="Issue not found")
    return _issues[issue_id_or_key]


# Create routes for both API versions
@router.post("/rest/api/2/issue")
@router.post("/rest/api/3/issue")
async def create_issue(issue: IssueCreate) -> dict[str, Any]:
    """Create a new issue."""
    key = f"TEST-{len(_issues) // 2 + 1}"  # Divide by 2 since we store by both key and id
    issue_id = str(len(_issues) // 2 + 1)
    now = _now_iso()

    new_issue = {
        "id": issue_id,
        "key": key,
        "self": f"http://localhost:8000/rest/api/3/issue/{key}",
        "fields": {
            "summary": issue.fields.summary,
            "description": issue.fields.description,
            "issuetype": issue.fields.issuetype or {"name": "Task"},
            "project": issue.fields.project or {"key": "TEST"},
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
            "priority": {"name": "Medium"},
            "assignee": None,
            "reporter": {"displayName": "Demo User"},
            "labels": [],
            "created": now,
            "updated": now,
            "comment": {"comments": [], "total": 0},
        },
    }

    # Store by both key and ID for lookup flexibility
    _issues[key] = new_issue
    _issues[issue_id] = new_issue

    return new_issue


@router.get("/rest/api/2/issue/{issue_id_or_key}")
@router.get("/rest/api/3/issue/{issue_id_or_key}")
async def get_issue(issue_id_or_key: str) -> dict[str, Any]:
    """Get an issue by ID or key."""
    return _get_issue(issue_id_or_key)


@router.put("/rest/api/2/issue/{issue_id_or_key}")
@router.put("/rest/api/3/issue/{issue_id_or_key}")
async def update_issue(issue_id_or_key: str, request: Request) -> Response:
    """Update an issue.

    Note: We manually parse the body instead of using Pydantic to handle
    cases where Content-Type header is lost during 307 redirects.
    """
    logger.info(f"[MockJIRA] PUT issue {issue_id_or_key}")
    logger.info(f"[MockJIRA] Headers: {dict(request.headers)}")

    issue = _get_issue(issue_id_or_key)

    # Parse body manually to handle missing Content-Type after redirect
    try:
        body_bytes = await request.body()
        logger.info(f"[MockJIRA] Body bytes: {body_bytes}")
        if body_bytes:
            update = json.loads(body_bytes)
            logger.info(f"[MockJIRA] Parsed update: {update}")

            if "fields" in update:
                fields = update["fields"]
                if fields.get("summary"):
                    issue["fields"]["summary"] = fields["summary"]
                if fields.get("description") is not None:
                    issue["fields"]["description"] = fields["description"]
                # Update the timestamp to enable conflict detection
                issue["fields"]["updated"] = _now_iso()
                logger.info(f"[MockJIRA] Updated issue {issue_id_or_key}")
    except json.JSONDecodeError as e:
        logger.error(f"[MockJIRA] JSON decode error: {e}")
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    return Response(status_code=204)


@router.get("/rest/api/2/issue/{issue_id_or_key}/comment")
@router.get("/rest/api/3/issue/{issue_id_or_key}/comment")
async def get_comments(issue_id_or_key: str) -> dict[str, Any]:
    """Get comments for an issue."""
    logger.info(f"[MockJIRA] GET comments for {issue_id_or_key}")
    issue = _get_issue(issue_id_or_key)
    if "comment" not in issue["fields"]:
        logger.info(f"[MockJIRA] No comments for {issue_id_or_key}")
        return {"comments": [], "total": 0, "startAt": 0, "maxResults": 50}
    result = {
        "comments": issue["fields"]["comment"]["comments"],
        "total": issue["fields"]["comment"]["total"],
        "startAt": 0,
        "maxResults": 50,
    }
    logger.info(f"[MockJIRA] Returning {result['total']} comments for {issue_id_or_key}")
    return result


@router.post("/rest/api/2/issue/{issue_id_or_key}/comment")
@router.post("/rest/api/3/issue/{issue_id_or_key}/comment")
async def add_comment(issue_id_or_key: str, comment: CommentCreate) -> dict[str, Any]:
    """Add a comment to an issue."""
    logger.info(f"[MockJIRA] POST comment to {issue_id_or_key}")
    issue = _get_issue(issue_id_or_key)
    now = _now_iso()

    new_comment = {
        "id": str(uuid.uuid4()),
        "body": comment.body,
        "author": {"name": "user", "displayName": "User"},
        "created": now,
        "updated": now,
    }

    if "comment" not in issue["fields"]:
        issue["fields"]["comment"] = {"comments": [], "total": 0}

    issue["fields"]["comment"]["comments"].append(new_comment)
    issue["fields"]["comment"]["total"] = len(issue["fields"]["comment"]["comments"])
    # Update issue timestamp when comment is added
    issue["fields"]["updated"] = now

    logger.info(f"[MockJIRA] Added comment {new_comment['id']} to {issue_id_or_key}")
    return new_comment


@router.post("/rest/api/2/issue/{issue_id_or_key}/transitions")
@router.post("/rest/api/3/issue/{issue_id_or_key}/transitions")
async def transition_issue(
    issue_id_or_key: str, transition: TransitionRequest
) -> Response:
    """Transition an issue to a new status."""
    issue = _get_issue(issue_id_or_key)
    target_transition_id = transition.transition.get("id")

    # Find target status based on transition ID
    target_status = None
    for t in DEFAULT_TRANSITIONS:
        if t["id"] == target_transition_id:
            target_status = t["to"]
            break

    if not target_status:
        raise HTTPException(status_code=400, detail="Invalid transition ID")

    issue["fields"]["status"] = target_status
    # Update timestamp on status change
    issue["fields"]["updated"] = _now_iso()
    return Response(status_code=204)


@router.get("/rest/api/2/issue/{issue_id_or_key}/transitions")
@router.get("/rest/api/3/issue/{issue_id_or_key}/transitions")
async def get_transitions(issue_id_or_key: str) -> dict[str, Any]:
    """Get available transitions for an issue."""
    _get_issue(issue_id_or_key)  # Validate issue exists
    return {"transitions": DEFAULT_TRANSITIONS}


@router.get("/rest/api/2/search/jql")
@router.get("/rest/api/3/search/jql")
async def search_issues(
    jql: str = "",
    maxResults: int = 50,
    fields: str | None = None,
    nextPageToken: str | None = None,
) -> dict[str, Any]:
    """Search for issues using JQL (simplified implementation)."""
    # Get unique issues (since we store by both key and id)
    seen_ids = set()
    unique_issues = []
    for issue in _issues.values():
        if issue["id"] not in seen_ids:
            seen_ids.add(issue["id"])
            unique_issues.append(issue)

    # Sort by updated timestamp (descending by default, but JQL can override)
    if "order by" in jql.lower():
        if "asc" in jql.lower():
            unique_issues.sort(
                key=lambda x: x["fields"].get("updated", ""),
                reverse=False
            )
        else:
            unique_issues.sort(
                key=lambda x: x["fields"].get("updated", ""),
                reverse=True
            )

    # Simple pagination (no actual nextPageToken implementation for mock)
    total = len(unique_issues)
    issues = unique_issues[:maxResults]

    return {
        "startAt": 0,
        "maxResults": maxResults,
        "total": total,
        "issues": issues,
    }


def reset_storage() -> None:
    """Reset the in-memory storage (useful for testing)."""
    _issues.clear()
