import pytest
from fastapi.testclient import TestClient
from main import app
from services.auth_service import create_user
import uuid

client = TestClient(app)

def test_register_user():
    # Generate a unique username
    unique_username = f"testuser_{uuid.uuid4().hex[:8]}"
    response = client.post(
        "/register",
        json={
            "username": unique_username,
            "password": "testpassword"
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_user():
    # Generate a unique username
    unique_username = f"testuser_{uuid.uuid4().hex[:8]}"
    # First register a user
    client.post(
        "/register",
        json={
            "username": unique_username,
            "password": "testpassword"
        }
    )
    
    # Then try to login
    response = client.post(
        "/login",
        json={
            "username": unique_username,
            "password": "testpassword"
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_invalid_credentials():
    response = client.post(
        "/login",
        json={
            "username": "nonexistent",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"] 