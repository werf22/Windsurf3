import pytest
import sys, os
from fastapi.testclient import TestClient
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from main import app, engine
from sqlmodel import SQLModel

@pytest.fixture(name="client")
def client_fixture():
    # Reset schema
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    with TestClient(app) as c:
        yield c
    SQLModel.metadata.drop_all(engine)


def basic_auth():
    import base64
    return {"Authorization": "Basic " + base64.b64encode(b"jakub:cerulik123").decode()}


def test_import_tasks(client):
    # Prepare CSV content
    csv_content = "Name,Description\nTask A,Desc A\nTask B,Desc B"
    response = client.post(
        "/api/tasks/import",
        files={"file": ("tasks.csv", csv_content, "text/csv")},
        headers=basic_auth()
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert data[0]["name"] == "Task A"
    assert data[1]["description"] == "Desc B"
