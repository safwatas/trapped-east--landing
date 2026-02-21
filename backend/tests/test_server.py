"""
Backend Tests for FastAPI Server

Tests the FastAPI routes, status checks, and CORS configuration.

BT-01: GET /api/ — returns Hello World
BT-02: POST /api/status — creates status check with valid data
BT-03: POST /api/status — rejects missing client_name
BT-04: GET /api/status — returns list of status checks
BT-05: CORS — correct headers
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import os


# Set required env vars BEFORE importing the app
os.environ.setdefault('MONGO_URL', 'mongodb://localhost:27017')
os.environ.setdefault('DB_NAME', 'test_trapped_egypt')
os.environ.setdefault('CORS_ORIGINS', 'http://localhost:3000,https://trapped-egypt.vercel.app')


# We need to mock MongoDB before importing the server module
@pytest.fixture
def mock_mongo():
    """Mock the MongoDB client and database."""
    with patch('server.client') as mock_client, \
         patch('server.db') as mock_db:
        # Create mock collections
        mock_collection = MagicMock()
        mock_db.status_checks = mock_collection
        
        yield mock_db, mock_collection


@pytest.fixture
def test_client(mock_mongo):
    """Create a test client with mocked MongoDB."""
    from httpx import AsyncClient, ASGITransport
    from server import app
    
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


# ──────────────────────────────────
# BT-01: GET /api/
# ──────────────────────────────────
@pytest.mark.asyncio
async def test_bt01_root_returns_hello_world(test_client):
    """BT-01: GET /api/ returns Hello World with status 200"""
    async with test_client as client:
        response = await client.get("/api/")
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Hello World"


# ──────────────────────────────────
# BT-02: POST /api/status — valid data
# ──────────────────────────────────
@pytest.mark.asyncio
async def test_bt02_create_status_check(test_client, mock_mongo):
    """BT-02: POST /api/status creates status check with valid client_name"""
    mock_db, mock_collection = mock_mongo
    mock_collection.insert_one = AsyncMock(return_value=MagicMock(inserted_id='mock-id'))
    
    async with test_client as client:
        response = await client.post(
            "/api/status",
            json={"client_name": "test_client_app"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["client_name"] == "test_client_app"
        assert "id" in data
        assert "timestamp" in data
        # Verify UUID format
        assert len(data["id"]) == 36  # UUID format: 8-4-4-4-12


# ──────────────────────────────────
# BT-03: POST /api/status — missing client_name
# ──────────────────────────────────
@pytest.mark.asyncio
async def test_bt03_create_status_missing_field(test_client):
    """BT-03: POST /api/status rejects request with missing client_name"""
    async with test_client as client:
        response = await client.post(
            "/api/status",
            json={}
        )
        
        assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_bt03b_create_status_no_body(test_client):
    """BT-03b: POST /api/status rejects request with no JSON body"""
    async with test_client as client:
        response = await client.post("/api/status")
        
        assert response.status_code == 422


# ──────────────────────────────────
# BT-04: GET /api/status — list checks
# ──────────────────────────────────
@pytest.mark.asyncio
async def test_bt04_get_status_checks(test_client, mock_mongo):
    """BT-04: GET /api/status returns list of previously created checks"""
    mock_db, mock_collection = mock_mongo
    
    mock_data = [
        {"id": "uuid-1", "client_name": "client_a", "timestamp": "2026-02-16T10:00:00+00:00"},
        {"id": "uuid-2", "client_name": "client_b", "timestamp": "2026-02-16T11:00:00+00:00"}
    ]
    
    # Mock the find().to_list() chain
    mock_cursor = MagicMock()
    mock_cursor.to_list = AsyncMock(return_value=mock_data)
    mock_collection.find = MagicMock(return_value=mock_cursor)
    
    async with test_client as client:
        response = await client.get("/api/status")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2
        assert data[0]["client_name"] == "client_a"
        assert data[1]["client_name"] == "client_b"


# ──────────────────────────────────
# BT-05: CORS Configuration
# ──────────────────────────────────
@pytest.mark.asyncio
async def test_bt05_cors_headers(test_client):
    """BT-05: CORS headers are set for allowed origins"""
    async with test_client as client:
        response = await client.options(
            "/api/",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET"
            }
        )
        
        # Should include CORS headers for allowed origin
        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers
