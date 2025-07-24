import sys
import os
import pytest
from fastapi.testclient import TestClient

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app

client = TestClient(app)

# Test user credentials (should exist in test DB)
TEST_USER = {
    "username": "test@gmail.com",
    "password": "testpassword"
}

def test_login_success():
    response = client.post("/api/auth/login", json=TEST_USER)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

# Helper to get token for authenticated tests
def get_token():
    response = client.post("/api/auth/login", json=TEST_USER)
    assert response.status_code == 200
    return response.json()["access_token"]

def test_sync_status():
    response = client.get("/api/sync-status")
    assert response.status_code == 200
    data = response.json()
    assert "date" in data
    assert "columns" in data
    assert "data" in data

def test_summary_authenticated():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/summary", headers=headers)
    assert response.status_code == 200
    data = response.json()
    # Match the actual response keys
    expected_keys = [
        "date", "total_users", "total_raw", "total_bronze", "total_silver", "raw_to_bronze_status", "bronze_to_silver_status", "successful_ingestions", "failed_ingestions", "users", "total_pages", "page", "page_size"
    ]
    missing = [key for key in expected_keys if key not in data]
    if missing:
        print(f"/api/summary response keys: {list(data.keys())}")
        print(f"Missing keys: {missing}")
    assert not missing

def test_user_settings_authenticated():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/user-settings", headers=headers)
    assert response.status_code == 200 or response.status_code == 404  # 404 if no settings
    # If 200, check structure
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data, dict) 