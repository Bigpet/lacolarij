"""Relay service for forwarding requests to JIRA servers."""

import base64
from dataclasses import dataclass
from typing import Any

import httpx

from app.core.security import decrypt_api_token
from app.models.connection import JiraConnection


@dataclass
class RelayResponse:
    """Response from a JIRA relay request."""

    status_code: int
    headers: dict[str, str]
    body: bytes | None


class RelayService:
    """Service for proxying requests to JIRA servers."""

    def __init__(self, timeout: float = 30.0):
        self.timeout = timeout

    def _get_auth_header(self, connection: JiraConnection) -> str:
        """Generate Basic Auth header for JIRA connection."""
        api_token = decrypt_api_token(connection.api_token_encrypted)
        credentials = f"{connection.email}:{api_token}"
        encoded = base64.b64encode(credentials.encode()).decode()
        return f"Basic {encoded}"

    def _get_api_path(self, connection: JiraConnection, path: str) -> str:
        """Get the full API path based on API version."""
        # Handle paths that already include /rest/api/
        if path.startswith("/rest/api/"):
            # Replace the version number if needed
            if connection.api_version == 2:
                path = path.replace("/rest/api/3/", "/rest/api/2/")
            elif connection.api_version == 3:
                path = path.replace("/rest/api/2/", "/rest/api/3/")
            return path
        # Otherwise, prefix with the appropriate API version
        return f"/rest/api/{connection.api_version}{path}"

    async def forward_request(
        self,
        connection: JiraConnection,
        method: str,
        path: str,
        body: dict[str, Any] | None = None,
        query_params: dict[str, str] | None = None,
        headers: dict[str, str] | None = None,
    ) -> RelayResponse:
        """
        Forward a request to JIRA, injecting authentication.

        Args:
            connection: The JIRA connection to use
            method: HTTP method (GET, POST, PUT, DELETE, etc.)
            path: The JIRA API path (e.g., /rest/api/3/issue/TEST-1)
            body: Optional JSON body for the request
            query_params: Optional query parameters
            headers: Optional additional headers

        Returns:
            RelayResponse containing status, headers, and body
        """
        # Build target URL
        base_url = connection.jira_url.rstrip("/")
        api_path = self._get_api_path(connection, path)
        url = f"{base_url}{api_path}"

        # Build headers
        request_headers = {
            "Authorization": self._get_auth_header(connection),
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if headers:
            request_headers.update(headers)

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.request(
                method=method.upper(),
                url=url,
                json=body,
                params=query_params,
                headers=request_headers,
            )

            # Extract response headers (forward all except hop-by-hop headers)
            # Hop-by-hop headers that should NOT be forwarded:
            hop_by_hop_headers = {
                "connection",
                "keep-alive",
                "proxy-authenticate",
                "proxy-authorization",
                "te",
                "trailers",
                "transfer-encoding",
                "upgrade",
                "content-length",  # Let FastAPI recalculate this
                "authorization",   # Don't leak auth headers
            }
            
            response_headers = {}
            for key, value in response.headers.items():
                if key.lower() not in hop_by_hop_headers:
                    response_headers[key] = value

            return RelayResponse(
                status_code=response.status_code,
                headers=response_headers,
                body=response.content if response.content else None,
            )

    async def search_issues(
        self,
        connection: JiraConnection,
        jql: str | None = None,
        next_page_token: str | None = None,
        max_results: int = 50,
        fields: list[str] | None = None,
    ) -> dict[str, Any]:
        """Search for issues using JQL with nextPageToken pagination."""
        query_params: dict[str, str] = {
            "jql": jql or "",
            "maxResults": str(max_results),
        }
        
        if next_page_token:
            query_params["nextPageToken"] = next_page_token
            
        if fields:
            query_params["fields"] = ",".join(fields)

        response = await self.forward_request(
            connection=connection,
            method="GET",
            path="/rest/api/3/search/jql",
            query_params=query_params,
        )

        if response.status_code == 200 and response.body:
            import json

            return json.loads(response.body)
        else:
            raise RelayError(response.status_code, response.body)

    async def get_issue(
        self, connection: JiraConnection, issue_id_or_key: str
    ) -> dict[str, Any]:
        """Get a single issue by ID or key."""
        response = await self.forward_request(
            connection=connection,
            method="GET",
            path=f"/rest/api/3/issue/{issue_id_or_key}",
        )

        if response.status_code == 200 and response.body:
            import json

            return json.loads(response.body)
        else:
            raise RelayError(response.status_code, response.body)

    async def get_comments(
        self, connection: JiraConnection, issue_id_or_key: str
    ) -> dict[str, Any]:
        """Get comments for an issue."""
        response = await self.forward_request(
            connection=connection,
            method="GET",
            path=f"/rest/api/3/issue/{issue_id_or_key}/comment",
        )

        if response.status_code == 200 and response.body:
            import json

            return json.loads(response.body)
        else:
            raise RelayError(response.status_code, response.body)

    async def add_comment(
        self, connection: JiraConnection, issue_id_or_key: str, body: dict[str, Any]
    ) -> dict[str, Any]:
        """Add a comment to an issue."""
        response = await self.forward_request(
            connection=connection,
            method="POST",
            path=f"/rest/api/3/issue/{issue_id_or_key}/comment",
            body=body,
        )

        if response.status_code in (200, 201) and response.body:
            import json

            return json.loads(response.body)
        else:
            raise RelayError(response.status_code, response.body)


class RelayError(Exception):
    """Error from JIRA relay operation."""

    def __init__(self, status_code: int, body: bytes | None):
        self.status_code = status_code
        self.body = body
        message = f"JIRA request failed with status {status_code}"
        if body:
            try:
                import json

                error_data = json.loads(body)
                if "errorMessages" in error_data:
                    message = "; ".join(error_data["errorMessages"])
                elif "message" in error_data:
                    message = error_data["message"]
            except (json.JSONDecodeError, KeyError):
                pass
        super().__init__(message)


# Singleton instance
relay_service = RelayService()
