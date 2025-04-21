import sys
import os
import pytest
from fastapi.testclient import TestClient
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from main import app, engine
from sqlmodel import Session, SQLModel

@pytest.fixture(name="client")
def client_fixture():
    # Ensure schema matches current models
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    with TestClient(app) as c:
        yield c
    SQLModel.metadata.drop_all(engine)

def basic_auth():
    import base64
    return {
        "Authorization": "Basic " + base64.b64encode(b"jakub:cerulik123").decode()
    }

def create_task(client, name="Parent Task"):
    resp = client.post(
        "/api/tasks/",
        json={"name": name},
        headers=basic_auth()
    )
    assert resp.status_code in (200, 201)
    return resp.json()["id"] if "id" in resp.json() else resp.json().get("id", 1)

def test_subtask_crud(client):
    # Create parent task
    resp = client.post("/api/tasks/", json={"name": "Parent Task"}, headers=basic_auth())
    assert resp.status_code in (200, 201)
    parent = resp.json()
    parent_id = parent["id"]

    # Create subtask
    subtask_data = {"name": "Subtask 1", "description": "Desc"}
    resp = client.post(f"/api/tasks/{parent_id}/subtasks", json=subtask_data, headers=basic_auth())
    assert resp.status_code == 201
    subtask = resp.json()
    assert subtask["parent_task_id"] == parent_id
    subtask_id = subtask["id"]

    # List subtasks
    resp = client.get(f"/api/tasks/{parent_id}/subtasks", headers=basic_auth())
    assert resp.status_code == 200
    assert any(st["id"] == subtask_id for st in resp.json())

    # Update subtask
    updated = {"name": "Subtask 1 Updated", "description": "Updated Desc"}
    resp = client.patch(f"/api/subtasks/{subtask_id}", json=updated, headers=basic_auth())
    assert resp.status_code == 200
    assert resp.json()["name"] == updated["name"]

    # Delete subtask
    resp = client.delete(f"/api/subtasks/{subtask_id}", headers=basic_auth())
    assert resp.status_code == 204

    # Ensure subtask is gone
    resp = client.get(f"/api/tasks/{parent_id}/subtasks", headers=basic_auth())
    assert all(st["id"] != subtask_id for st in resp.json())
