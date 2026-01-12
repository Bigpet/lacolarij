"""User settings API endpoints (JIRA connections management)."""

from fastapi import APIRouter

from app.core.exceptions import ForbiddenError, NotFoundError
from app.core.security import encrypt_api_token
from app.dependencies import ConnectionRepo, CurrentUser
from app.models.schemas import (
    JiraConnectionCreate,
    JiraConnectionResponse,
    JiraConnectionUpdate,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/connections", response_model=list[JiraConnectionResponse])
async def list_connections(
    current_user: CurrentUser,
    conn_repo: ConnectionRepo,
) -> list[JiraConnectionResponse]:
    """List all JIRA connections for the current user."""
    connections = await conn_repo.get_by_user_id(current_user.id)
    return [JiraConnectionResponse.model_validate(c) for c in connections]


@router.post("/connections", response_model=JiraConnectionResponse, status_code=201)
async def create_connection(
    connection_data: JiraConnectionCreate,
    current_user: CurrentUser,
    conn_repo: ConnectionRepo,
) -> JiraConnectionResponse:
    """Create a new JIRA connection."""
    # If this is set as default, clear other defaults
    if connection_data.is_default:
        await conn_repo.clear_default(current_user.id)

    # Encrypt the API token
    encrypted_token = encrypt_api_token(connection_data.api_token)

    connection = await conn_repo.create(
        user_id=current_user.id,
        name=connection_data.name,
        jira_url=connection_data.jira_url,
        email=connection_data.email,
        api_token_encrypted=encrypted_token,
        api_version=connection_data.api_version,
        is_default=connection_data.is_default,
    )

    return JiraConnectionResponse.model_validate(connection)


@router.get("/connections/{connection_id}", response_model=JiraConnectionResponse)
async def get_connection(
    connection_id: str,
    current_user: CurrentUser,
    conn_repo: ConnectionRepo,
) -> JiraConnectionResponse:
    """Get a specific JIRA connection."""
    connection = await conn_repo.get_by_id(connection_id)
    if not connection:
        raise NotFoundError("Connection")

    if connection.user_id != current_user.id:
        raise ForbiddenError()

    return JiraConnectionResponse.model_validate(connection)


@router.put("/connections/{connection_id}", response_model=JiraConnectionResponse)
async def update_connection(
    connection_id: str,
    connection_data: JiraConnectionUpdate,
    current_user: CurrentUser,
    conn_repo: ConnectionRepo,
) -> JiraConnectionResponse:
    """Update a JIRA connection."""
    connection = await conn_repo.get_by_id(connection_id)
    if not connection:
        raise NotFoundError("Connection")

    if connection.user_id != current_user.id:
        raise ForbiddenError()

    if connection.is_locked:
        raise ForbiddenError("Cannot modify locked demo connection")

    # Prepare update data
    update_data = connection_data.model_dump(exclude_unset=True)

    # If setting as default, clear other defaults
    if update_data.get("is_default"):
        await conn_repo.clear_default(current_user.id)

    # Encrypt new API token if provided
    if "api_token" in update_data:
        update_data["api_token_encrypted"] = encrypt_api_token(
            update_data.pop("api_token")
        )

    connection = await conn_repo.update(connection, **update_data)

    return JiraConnectionResponse.model_validate(connection)


@router.delete("/connections/{connection_id}", status_code=204)
async def delete_connection(
    connection_id: str,
    current_user: CurrentUser,
    conn_repo: ConnectionRepo,
) -> None:
    """Delete a JIRA connection."""
    connection = await conn_repo.get_by_id(connection_id)
    if not connection:
        raise NotFoundError("Connection")

    if connection.user_id != current_user.id:
        raise ForbiddenError()

    if connection.is_locked:
        raise ForbiddenError("Cannot delete locked demo connection")

    await conn_repo.delete(connection)
