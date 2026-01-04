
import pytest
from unittest.mock import MagicMock, patch
import httpx
from uuid import uuid4

from app.services.relay_service import RelayService
from app.models.user import JiraConnection
from app.core.security import encrypt_api_token
from app.core.exceptions import RelayError

@pytest.fixture
def relay_service():
    return RelayService()

@pytest.fixture
def mock_connection():
    return JiraConnection(
        id=str(uuid4()),
        user_id=str(uuid4()),
        name="Test JIRA",
        jira_url="https://jira.example.com",
        email="test@example.com",
        api_token_encrypted=encrypt_api_token("test-token"),
        api_version="3",
        is_default=False
    )

@pytest.mark.asyncio
async def test_forward_request_success(relay_service, mock_connection):
    """Test successful request forwarding."""
    
    # Mock httpx response
    mock_response = httpx.Response(200, json={"key": "TEST-1"})
    
    with patch("httpx.AsyncClient.request", return_value=mock_response) as mock_req:
        response = await relay_service.forward_request(
            connection=mock_connection,
            method="GET",
            path="rest/api/3/issue/TEST-1"
        )
        
        assert response.status_code == 200
        assert response.json()["key"] == "TEST-1"
        
        # Verify call args
        mock_req.assert_called_once()
        call_kwargs = mock_req.call_args.kwargs
        
        assert call_kwargs["method"] == "GET"
        assert call_kwargs["url"] == "https://jira.example.com/rest/api/3/issue/TEST-1"
        assert call_kwargs["auth"] == ("test@example.com", "test-token")

@pytest.mark.asyncio
async def test_forward_request_with_body(relay_service, mock_connection):
    """Test forwarding with body."""
    
    mock_response = httpx.Response(201, json={"id": "1000"})
    body = {"fields": {"summary": "Test"}}
    
    with patch("httpx.AsyncClient.request", return_value=mock_response) as mock_req:
        await relay_service.forward_request(
            connection=mock_connection,
            method="POST",
            path="rest/api/3/issue",
            body=body
        )
        
        call_kwargs = mock_req.call_args.kwargs
        assert call_kwargs["json"] == body

@pytest.mark.asyncio
async def test_forward_request_error(relay_service, mock_connection):
    """Test handling of request errors."""
    
    mock_request = httpx.Request("GET", "https://jira.example.com/test")
    error = httpx.RequestError("Network error", request=mock_request)
    
    with patch("httpx.AsyncClient.request", side_effect=error) as mock_req:
        with pytest.raises(RelayError) as exc:
            await relay_service.forward_request(
                connection=mock_connection,
                method="GET",
                path="test"
            )
        
        assert "https://jira.example.com/test" in str(exc.value.detail)

