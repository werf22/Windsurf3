import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

@pytest.mark.order(1)
def test_register_and_login():
    # Register user
    resp = client.post("/api/register", json={
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "testpass123"
    })
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["username"] == "testuser"
    assert data["email"] == "testuser@example.com"

    # Login user
    resp = client.post("/api/login", data={
        "username": "testuser",
        "password": "testpass123"
    })
    assert resp.status_code == 200, resp.text
    token = resp.json()["access_token"]
    assert token

    # Fetch profile
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/profile", headers=headers)
    assert resp.status_code == 200, resp.text
    profile = resp.json()
    assert profile["username"] == "testuser"
    assert profile["email"] == "testuser@example.com"

@pytest.mark.order(2)
def test_update_and_delete_profile():
    # Register and login
    resp = client.post("/api/register", json={
        "username": "edituser",
        "email": "edituser@example.com",
        "password": "editpass123"
    })
    assert resp.status_code == 200, resp.text
    resp = client.post("/api/login", data={
        "username": "edituser",
        "password": "editpass123"
    })
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    # Update profile
    resp = client.put("/api/profile", json={"username": "editeduser", "email": "edited@example.com", "password": "newpass123"}, headers=headers)
    assert resp.status_code == 200, resp.text
    profile = resp.json()
    assert profile["username"] == "editeduser"
    assert profile["email"] == "edited@example.com"
    # Delete profile
    resp = client.delete("/api/profile", headers=headers)
    assert resp.status_code == 200, resp.text
    assert resp.json()["detail"] == "Account deleted"
