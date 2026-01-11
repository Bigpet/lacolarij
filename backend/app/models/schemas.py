"""Pydantic schemas for request/response validation."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

# --- Auth Schemas ---


class UserCreate(BaseModel):
    """Schema for user registration."""

    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8, max_length=100)


class UserLogin(BaseModel):
    """Schema for user login."""

    username: str
    password: str


class UserResponse(BaseModel):
    """Schema for user in responses."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str
    created_at: datetime


class Token(BaseModel):
    """Schema for JWT token response."""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for data encoded in JWT."""

    user_id: str | None = None


# --- Connection Schemas ---


class JiraConnectionCreate(BaseModel):
    """Schema for creating a JIRA connection."""

    name: str = Field(..., min_length=1, max_length=100)
    jira_url: str = Field(..., min_length=1, max_length=500)
    email: str = Field(..., min_length=1, max_length=255)
    api_token: str = Field(..., min_length=1)
    api_version: int = Field(default=3, ge=2, le=3)
    is_default: bool = False


class JiraConnectionUpdate(BaseModel):
    """Schema for updating a JIRA connection."""

    name: str | None = Field(None, min_length=1, max_length=100)
    jira_url: str | None = Field(None, min_length=1, max_length=500)
    email: str | None = Field(None, min_length=1, max_length=255)
    api_token: str | None = Field(None, min_length=1)
    api_version: int | None = Field(None, ge=2, le=3)
    is_default: bool | None = None


class JiraConnectionResponse(BaseModel):
    """Schema for JIRA connection in responses (without sensitive data)."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    jira_url: str
    email: str
    api_version: int
    is_default: bool
    created_at: datetime


# --- Error Schemas ---


class ErrorResponse(BaseModel):
    """Schema for error responses."""

    detail: str
