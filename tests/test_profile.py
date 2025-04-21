import pytest
from fastapi.testclient import TestClient
from main import app
from models import User
from sqlmodel import Session, SQLModel
from init_db import engine

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_and_teardown_db():
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)

@pytest.fixture
def register_user():
    data = {"username": "profileuser", "email": "profile@example.com", "password": "profilepass"}
    resp = client.post("/register", json=data)
    assert resp.status_code == 200
    return data

@pytest.fixture
def get_token(register_user):
    resp = client.post("/login", data={"username": register_user["username"], "password": register_user["password"]})
    assert resp.status_code == 200
    return resp.json()["access_token"]

def test_get_profile(get_token):
    headers = {"Authorization": f"Bearer {get_token}"}
    resp = client.get("/profile", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["username"] == "profileuser"
    assert data["email"] == "profile@example.com"

def test_update_profile_email(get_token):
    headers = {"Authorization": f"Bearer {get_token}"}
    new_email = "newprofile@example.com"
    resp = client.put("/profile", json={"email": new_email}, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == new_email

def test_update_profile_password(get_token):
    headers = {"Authorization": f"Bearer {get_token}"}
    resp = client.put("/profile", json={"password": "newpass123"}, headers=headers)
    assert resp.status_code == 200
    # Now login with new password
    login = client.post("/login", data={"username": "profileuser", "password": "newpass123"})
    assert login.status_code == 200

def test_delete_profile(get_token):
    headers = {"Authorization": f"Bearer {get_token}"}
    resp = client.delete("/profile", headers=headers)
    assert resp.status_code == 200
    # Profile should be gone
    resp2 = client.get("/profile", headers=headers)
    assert resp2.status_code == 401
