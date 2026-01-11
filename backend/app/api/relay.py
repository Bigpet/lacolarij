"""JIRA relay proxy API endpoints."""

import json
import logging
from typing import Any

from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import RedirectResponse

from app.dependencies import ConnectionRepo, CurrentUser
from app.services.relay_service import RelayError, relay_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/jira", tags=["jira-relay"])


async def _get_connection_for_user(
    connection_id: str,
    current_user: CurrentUser,
    connection_repo: ConnectionRepo,
):
    """Get and validate a connection belongs to the current user."""
    logger.info(f"[Relay] Looking up connection: {connection_id} for user: {current_user.id}")
    connection = await connection_repo.get_by_id(connection_id)
    if not connection:
        logger.error(f"[Relay] Connection {connection_id} not found in database")
        logger.error(f"[Relay] User {current_user.id} has these connections:")
        all_connections = await connection_repo.get_by_user_id(current_user.id)
        if not all_connections:
            logger.error("[Relay]   (no connections found for this user)")
        for conn in all_connections:
            logger.error(f"[Relay]   - {conn.id}: {conn.name} ({conn.jira_url})")
        raise HTTPException(status_code=404, detail="Connection not found")
    if connection.user_id != current_user.id:
        logger.error(f"[Relay] Connection {connection_id} belongs to user {connection.user_id}, not {current_user.id}")
        raise HTTPException(status_code=403, detail="Not authorized to use this connection")
    logger.info(f"[Relay] Found connection: {connection.name} ({connection.jira_url})")
    return connection


# IMPORTANT: Specific routes must be defined BEFORE the catch-all route
# This ensures that routes like /{connection_id}/search are matched before
# the catch-all /{connection_id}/rest/api/{api_version}/{path:path} pattern

@router.get("/{connection_id}/search")
async def search_issues(
    connection_id: str,
    current_user: CurrentUser,
    connection_repo: ConnectionRepo,
    jql: str | None = None,
    next_page_token: str | None = None,
    max_results: int = 50,
    fields: str | None = None,
) -> dict[str, Any]:
    """
    Search for issues using JQL with nextPageToken pagination.

    This is a convenience endpoint that wraps the JIRA search API.
    """
    logger.info(f"[Relay] Search issues via specific endpoint: {connection_id}")
    connection = await _get_connection_for_user(
        connection_id, current_user, connection_repo
    )

    # Parse fields if provided
    field_list = fields.split(",") if fields else None

    try:
        return await relay_service.search_issues(
            connection=connection,
            jql=jql,
            next_page_token=next_page_token,
            max_results=max_results,
            fields=field_list,
        )
    except RelayError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Relay error: {str(e)}")


@router.get("/{connection_id}/issue/{issue_key}")
async def get_issue(
    connection_id: str,
    issue_key: str,
    current_user: CurrentUser,
    connection_repo: ConnectionRepo,
) -> dict[str, Any]:
    """
    Get a single issue by key.

    This is a convenience endpoint that wraps the JIRA issue API.
    """
    logger.info(f"[Relay] Get issue {issue_key} via specific endpoint: {connection_id}")
    connection = await _get_connection_for_user(
        connection_id, current_user, connection_repo
    )

    try:
        return await relay_service.get_issue(
            connection=connection,
            issue_id_or_key=issue_key,
        )
    except RelayError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Relay error: {str(e)}")


# Core handler function for all relay requests
async def _relay_jira_request_impl(
    connection_id: str,
    api_version: str,
    path: str,
    request: Request,
    current_user: CurrentUser,
    connection_repo: ConnectionRepo,
) -> Response:
    """
    Forward a request to the JIRA server.

    This endpoint acts as a proxy, forwarding requests to the configured JIRA
    server while handling authentication and CORS.
    """
    # Validate connection
    connection = await _get_connection_for_user(
        connection_id, current_user, connection_repo
    )

    # Check if connection is the mock JIRA
    if connection.jira_url == "demo://local":
        # Redirect to mock JIRA (preserve query parameters)
        mock_path = f"/api/jira/mock/rest/api/{api_version}/{path}"
        if request.query_params:
            mock_path = f"{mock_path}?{request.query_params}"
        logger.info(f"[Relay] Redirecting to mock JIRA: {mock_path}")
        return RedirectResponse(url=mock_path, status_code=307)

    # Build the full path
    full_path = f"/rest/api/{api_version}/{path}"

    # Get query params
    query_params = dict(request.query_params) if request.query_params else None

    # Get body if present
    body: dict[str, Any] | None = None
    if request.method in ("POST", "PUT", "PATCH"):
        try:
            body_bytes = await request.body()
            if body_bytes:
                body = json.loads(body_bytes)
        except json.JSONDecodeError:
            pass

    # Get custom headers (exclude internal ones)
    headers: dict[str, str] = {}
    for key, value in request.headers.items():
        if key.lower() not in (
            "host",
            "authorization",
            "content-length",
            "connection",
        ):
            headers[key] = value

    try:
        logger.info(f"[Relay] {request.method} {full_path} -> {connection.jira_url}")
        response = await relay_service.forward_request(
            connection=connection,
            method=request.method,
            path=full_path,
            body=body,
            query_params=query_params,
            headers=headers,
        )
        logger.info(f"[Relay] Response: {response.status_code}")
        if response.status_code >= 400:
            logger.error(f"[Relay] Error body: {response.body}")

        return Response(
            content=response.body,
            status_code=response.status_code,
            headers=response.headers,
            media_type=response.headers.get("Content-Type", "application/json"),
        )
    except RelayError as e:
        logger.error(f"[Relay] RelayError: {e.status_code} - {e}")
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        import traceback
        logger.error(f"[Relay] Exception: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=502, detail=f"Relay error: {str(e)}")


# Catch-all route for JIRA API - must be LAST after all specific routes
# Using explicit route decorators instead of api_route to avoid 415 errors
@router.get("/{connection_id}/rest/api/{api_version}/{path:path}", include_in_schema=False)
@router.post("/{connection_id}/rest/api/{api_version}/{path:path}", include_in_schema=False)
@router.put("/{connection_id}/rest/api/{api_version}/{path:path}", include_in_schema=False)
@router.delete("/{connection_id}/rest/api/{api_version}/{path:path}", include_in_schema=False)
@router.patch("/{connection_id}/rest/api/{api_version}/{path:path}", include_in_schema=False)
async def relay_jira_request(
    connection_id: str,
    api_version: str,
    path: str,
    request: Request,
    current_user: CurrentUser,
    connection_repo: ConnectionRepo,
) -> Response:
    """Route handler wrapper that delegates to the implementation."""
    return await _relay_jira_request_impl(
        connection_id=connection_id,
        api_version=api_version,
        path=path,
        request=request,
        current_user=current_user,
        connection_repo=connection_repo,
    )
