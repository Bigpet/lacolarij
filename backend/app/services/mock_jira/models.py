"""Pydantic models for the mock JIRA server."""

from typing import Any

from pydantic import BaseModel


class IssueFields(BaseModel):
    """Fields for issue creation/update."""

    summary: str | None = None
    description: Any | None = None  # str for v2, ADF dict for v3
    issuetype: dict[str, Any] | None = None
    project: dict[str, Any] | None = None


class IssueCreate(BaseModel):
    """Schema for creating an issue."""

    fields: IssueFields


class IssueUpdate(BaseModel):
    """Schema for updating an issue."""

    fields: IssueFields | None = None
    update: dict[str, Any] | None = None


class CommentCreate(BaseModel):
    """Schema for creating a comment."""

    body: Any  # str for v2, ADF dict for v3


class TransitionRequest(BaseModel):
    """Schema for transitioning an issue."""

    transition: dict[str, Any]


# Default transitions available in the mock server
DEFAULT_TRANSITIONS = [
    {
        "id": "11",
        "name": "To Do",
        "to": {
            "name": "To Do",
            "id": "1",
            "statusCategory": {
                "id": 2,
                "key": "new",
                "colorName": "blue-gray",
                "name": "To Do",
            },
        },
    },
    {
        "id": "21",
        "name": "In Progress",
        "to": {
            "name": "In Progress",
            "id": "3",
            "statusCategory": {
                "id": 4,
                "key": "indeterminate",
                "colorName": "yellow",
                "name": "In Progress",
            },
        },
    },
    {
        "id": "31",
        "name": "Done",
        "to": {
            "name": "Done",
            "id": "10002",
            "statusCategory": {
                "id": 3,
                "key": "done",
                "colorName": "green",
                "name": "Done",
            },
        },
    },
]
