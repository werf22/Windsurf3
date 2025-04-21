from datetime import date, timedelta
import base64
import os
import sys
import pytest
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from fastapi.testclient import TestClient
from main import app, engine
from sqlmodel import SQLModel
from sqlalchemy import text

# reuse TestClient and auth from test_api
client = TestClient(app)

def auth_headers():
    user = os.getenv("AUTH_USERNAME", "jakub")
    pw = os.getenv("AUTH_PASSWORD", "cerulik123")
    token = base64.b64encode(f"{user}:{pw}".encode()).decode()
    return {"Authorization": f"Basic {token}"}

@pytest.fixture(autouse=True)
def clean_db():
    # Clean tables before test
    SQLModel.metadata.create_all(engine)
    with engine.connect() as conn:
        for tbl in ["tag", "task", "section", "project", "portfolio", "priority"]:
            conn.execute(text(f"DELETE FROM {tbl}"))
        conn.commit()

def test_dashboard_empty():
    resp = client.get("/api/dashboard", headers=auth_headers())
    assert resp.status_code == 200
    data = resp.json()
    assert data == {"total_tasks": 0, "completed_tasks": 0, "open_tasks": 0, "upcoming_due_7d": 0}

def test_dashboard_stats():
    # Setup dependencies
    p = client.post("/api/portfolios", json={"name": "D1"}, headers=auth_headers()).json()
    pr = client.post("/api/projects", json={"name": "P1", "portfolio_id": p["id"]}, headers=auth_headers()).json()
    s = client.post("/api/sections", json={"name": "S1", "project_id": pr["id"]}, headers=auth_headers()).json()
    pri = client.post("/api/priorities", json={"name": "Pri1"}, headers=auth_headers()).json()
    today = date.today()
    # Task1: due in 3 days, not completed
    client.post(
        "/api/tasks",
        json={
            "name": "T1", "portfolio_id": p["id"], "project_id": pr["id"],
            "section_id": s["id"], "priority_id": pri["id"],
            "due_date": (today + timedelta(days=3)).isoformat()
        },
        headers=auth_headers()
    )
    # Task2: due in 10 days, mark completed
    client.post(
        "/api/tasks",
        json={
            "name": "T2", "portfolio_id": p["id"], "project_id": pr["id"],
            "section_id": s["id"], "priority_id": pri["id"],
            "due_date": (today + timedelta(days=10)).isoformat(),
            "completed_at": today.isoformat()
        },
        headers=auth_headers()
    )
    resp = client.get("/api/dashboard", headers=auth_headers())
    assert resp.status_code == 200
    stats = resp.json()
    assert stats["total_tasks"] == 2
    assert stats["completed_tasks"] == 1
    assert stats["open_tasks"] == 1
    assert stats["upcoming_due_7d"] == 1
