
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, Query, Request, Response, Body
from app.dependencies import CurrentUser, ConnectionRepo
from app.services.relay_service import RelayService
from app.core.exceptions import NotFoundError, ForbiddenError

router = APIRouter(prefix="/jira", tags=["jira-relay"])

def get_relay_service() -> RelayService:
    return RelayService()

@router.api_route(
    "/{connection_id}/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
    response_model=None
)
async def proxy_jira_request(
    connection_id: str,
    path: str,
    request: Request,
    current_user: CurrentUser,
    conn_repo: ConnectionRepo,
    relay_service: RelayService = Depends(get_relay_service)
):
    """
    Proxy request to JIRA for a specific connection.
    path: The full path to forward (e.g. rest/api/3/issue/TEST-1)
    """
    
    # 1. Get connection and verify ownership
    connection = await conn_repo.get_by_id(connection_id)
    if not connection:
        raise NotFoundError(f"Connection {connection_id}")
    
    if connection.user_id != current_user.id:
        raise ForbiddenError("You do not have access to this connection")

    # 2. Extract request data
    body = None
    if request.method in ["POST", "PUT", "PATCH"]:
        try:
            body = await request.json()
        except:
            body = None # Could be empty body or non-JSON

    query_params = dict(request.query_params)
    
    # 3. Handle headers
    # Allow some headers to pass through, but probably not all
    # For now, let's keep it simple and maybe pass Content-Type if present
    response = await relay_service.forward_request(
        connection=connection,
        method=request.method,
        path=path,
        body=body,
        query_params=query_params
    )
    
    # 4. Return response
    # We want to return the raw content from JIRA
    # along with the status code and relevant headers
    
    headers = dict(response.headers)
    # Filter out headers that might cause issues?
    # e.g. Transfer-Encoding, Content-Encoding if we're decoding it
    # For now, FastAPI Response handles content-length, so we might strip that too
    
    excluded_headers = {
        "content-encoding", "content-length", "transfer-encoding", "connection", "host"
    }
    filtered_headers = {
        k: v for k, v in headers.items() if k.lower() not in excluded_headers
    }

    return Response(
        content=response.content,
        status_code=response.status_code,
        headers=filtered_headers,
        media_type=response.headers.get("content-type")
    )
