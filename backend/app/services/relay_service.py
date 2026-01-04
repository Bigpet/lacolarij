
import httpx
from fastapi import HTTPException, status
from typing import Any, Optional

from app.models.user import JiraConnection
from app.core.exceptions import RelayError
from app.core.security import decrypt_api_token

class RelayService:
    async def forward_request(
        self,
        connection: JiraConnection,
        method: str,
        path: str,
        body: Optional[Any] = None,
        query_params: Optional[dict] = None,
        headers: Optional[dict] = None,
    ) -> httpx.Response:
        """
        Forward a request to JIRA, injecting authentication.

        Args:
            connection: The JIRA connection configuration.
            method: HTTP method (GET, POST, PUT, DELETE).
            path: The relative API path (e.g., "rest/api/3/myself").
            body: Optional JSON body.
            query_params: Optional query parameters.
            headers: Optional headers (will be merged with auth headers).

        Returns:
            The httpx Response object from JIRA.
        
        Raises:
            RelayError: If the request fails or returns a 4xx/5xx error that we want to wrap.
        """
        
        # 1. Build target URL
        base_url = connection.jira_url.rstrip("/")
        # Ensure path doesn't start with / if base_url doesn't end with one (handled by rstrip)
        clean_path = path.lstrip("/")
        target_url = f"{base_url}/{clean_path}"

        # 2. Get credentials
        try:
            api_token = decrypt_api_token(connection.api_token_encrypted)
        except Exception as e:
            raise RelayError(f"Failed to decrypt API token: {str(e)}")

        # 3. Prepare headers
        request_headers = headers or {}
        # Add Basic Auth is handled by httpx.BasicAuth, but we can also set Authorization header directly if needed.
        # But httpx auth kwarg is cleaner.
        
        # 4. Forward request
        try:
            async with httpx.AsyncClient() as client:
                response = await client.request(
                    method=method,
                    url=target_url,
                    json=body,
                    params=query_params,
                    headers=request_headers,
                    auth=(connection.email, api_token),
                    timeout=30.0 # generous timeout for JIRA
                )
                
                # Check for errors? Or just return the response?
                # Usually a relay should pass through the status code 
                # unless there's a network error.
                
                return response

        except httpx.RequestError as exc:
            raise RelayError(f"An error occurred while requesting {exc.request.url!r}.") from exc
