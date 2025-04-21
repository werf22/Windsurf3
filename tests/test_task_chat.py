import os, sys
import base64
import pytest
from datetime import date
from fastapi.testclient import TestClient
from sqlmodel import SQLModel
from sqlalchemy import text
import importlib.util

# ensure imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

spec = importlib.util.spec_from_file_location(
    "main",
    os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'main.py'))
)
main_mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(main_mod)
app = main_mod.app
engine = main_mod.engine

client = TestClient(app)

def auth_headers():
    user = os.getenv("AUTH_USERNAME", "jakub")
    pw = os.getenv("AUTH_PASSWORD", "cerulik123")
    token = base64.b64encode(f"{user}:{pw}".encode()).decode()
    return {"Authorization": f"Basic {token}"}

@pytest.fixture(autouse=True)
def clean_db():
    # Create all tables and clean existing data
    SQLModel.metadata.create_all(engine)
    with engine.connect() as conn:
        for tbl in ["tag", "taskchatmessage", "task", "section", "project", "portfolio", "priority"]:
            try:
                conn.execute(text(f"DELETE FROM {tbl}"))
            except Exception:
                # Table might not exist yet
                pass
        conn.commit()

@pytest.fixture
def create_task():
    # create base dependencies and a task
    p = client.post("/api/portfolios", json={"name": "P"}, headers=auth_headers()).json()
    pr = client.post("/api/projects", json={"name": "Pr", "portfolio_id": p["id"]}, headers=auth_headers()).json()
    s = client.post("/api/sections", json={"name": "S", "project_id": pr["id"]}, headers=auth_headers()).json()
    pri = client.post("/api/priorities", json={"name": "Pri"}, headers=auth_headers()).json()
    t = client.post(
        "/api/tasks",
        json={"name": "T", "portfolio_id": p["id"], "project_id": pr["id"], "section_id": s["id"], "priority_id": pri["id"]},
        headers=auth_headers()
    ).json()
    return t

def test_get_empty_chat(create_task):
    t = create_task
    resp = client.get(f"/api/tasks/{t['id']}/chat", headers=auth_headers())
    assert resp.status_code == 200
    assert resp.json() == []

def test_post_and_get_chat(create_task):
    t = create_task
    # post a message
    resp = client.post(f"/api/tasks/{t['id']}/chat", json={"message": "Hello"}, headers=auth_headers())
    assert resp.status_code == 200
    messages = resp.json()
    # should contain two messages: user and ai
    assert len(messages) == 2
    assert messages[0]["sender"] == "jakub"
    assert messages[0]["message"] == "Hello"
    assert messages[1]["sender"] == "ai"
    assert messages[1]["message"] == "Echo: Hello"

    # verify GET returns same
    resp2 = client.get(f"/api/tasks/{t['id']}/chat", headers=auth_headers())
    assert resp2.status_code == 200
    msgs2 = resp2.json()
    assert len(msgs2) == 2
    assert msgs2 == messages
