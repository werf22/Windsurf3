import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from fastapi.testclient import TestClient
from main import app, engine
from sqlmodel import SQLModel, Session
import base64
from datetime import date
from sqlalchemy import text

@pytest.fixture(autouse=True)
def clean_db():
    # Clean all tables before each test
    with Session(engine) as session:
        session.exec(text("DELETE FROM tag"))
        session.exec(text("DELETE FROM task"))
        session.exec(text("DELETE FROM section"))
        session.exec(text("DELETE FROM project"))
        session.exec(text("DELETE FROM portfolio"))
        session.exec(text("DELETE FROM priority"))
        session.commit()

# Ensure all tables are created before any tests run
def setup_module(module):
    SQLModel.metadata.create_all(engine)

client = TestClient(app)

def auth_headers():
    user = os.getenv("AUTH_USERNAME", "jakub")
    pw = os.getenv("AUTH_PASSWORD", "cerulik123")
    token = base64.b64encode(f"{user}:{pw}".encode()).decode()
    return {"Authorization": f"Basic {token}"}

def test_create_and_get_portfolio():
    response = client.post("/api/portfolios", json={"name": "Personal", "description": "Personal Portfolio"}, headers=auth_headers())
    assert response.status_code == 200
    pid = response.json()["id"]
    response = client.get("/api/portfolios", headers=auth_headers())
    assert response.status_code == 200
    assert any(p["id"] == pid for p in response.json())

def test_create_and_get_task():
    # Create dependencies first
    portfolio = client.post("/api/portfolios", json={"name": "Work"}, headers=auth_headers()).json()
    project = client.post("/api/projects", json={"name": "ProjectX", "portfolio_id": portfolio["id"]}, headers=auth_headers()).json()
    section = client.post("/api/sections", json={"name": "SectionA", "project_id": project["id"]}, headers=auth_headers()).json()
    priority = client.post("/api/priorities", json={"name": "P1"}, headers=auth_headers()).json()
    # Create a task with new schema (use *_id fields)
    task_data = {
        "name": "Test Task",
        "portfolio_id": portfolio["id"],
        "project_id": project["id"],
        "section_id": section["id"],
        "priority_id": priority["id"]
    }
    response = client.post("/api/tasks", json=task_data, headers=auth_headers())
    assert response.status_code == 200
    tid = response.json()["id"]
    # Retrieve and check
    response = client.get(f"/api/tasks/{tid}", headers=auth_headers())
    assert response.status_code == 200
    task = response.json()
    print("DEBUG: returned task dict:", task)
    assert str(task["name"]) == "Test Task"
    assert str(task["portfolio_id"]) == str(portfolio["id"])
    assert str(task["project_id"]) == str(project["id"])
    assert str(task["section_id"]) == str(section["id"])
    assert str(task["priority_id"]) == str(priority["id"])

def test_csv_export_import():
    # Create a task so export is not empty
    portfolio = client.post("/api/portfolios", json={"name": "CSVPortfolio"}, headers=auth_headers()).json()
    project = client.post("/api/projects", json={"name": "CSVProject", "portfolio_id": portfolio["id"]}, headers=auth_headers()).json()
    section = client.post("/api/sections", json={"name": "CSVSection", "project_id": project["id"]}, headers=auth_headers()).json()
    priority = client.post("/api/priorities", json={"name": "CSVPriority"}, headers=auth_headers()).json()
    task_data = {
        "name": "CSV Task",
        "portfolio_id": portfolio["id"],
        "project_id": project["id"],
        "section_id": section["id"],
        "priority_id": priority["id"]
    }
    client.post("/api/tasks", json=task_data, headers=auth_headers())
    # Export
    response = client.get("/api/tasks/export/csv", headers=auth_headers())
    assert response.status_code == 200
    csv_data = response.content.decode()
    assert "name" in csv_data
    # Import (should not fail)
    files = {"file": ("tasks.csv", csv_data)}
    response = client.post("/api/tasks/import/csv", files=files, headers=auth_headers())
    assert response.status_code == 200
    assert "imported" in response.json()

def test_chat_endpoint():
    payload = {"message": "Hello AI!"}
    response = client.post("/api/chat", json=payload, headers=auth_headers())
    assert response.status_code == 200
    data = response.json()
    # Accept either the old or new echo format for robust test
    assert data["response"].startswith("AI says: ") or data["response"].startswith("[Echo]")

def test_auth_required():
    endpoints = [
        ("get", "/api/portfolios"),
        ("post", "/api/portfolios"),
        ("get", "/api/projects"),
        ("post", "/api/projects"),
        ("get", "/api/tasks"),
        ("post", "/api/tasks"),
        ("get", "/api/tasks/export/csv"),
        ("post", "/api/tasks/import/csv")
    ]
    for method, url in endpoints:
        resp = getattr(client, method)(url)
        assert resp.status_code == 401

def test_update_task_endpoint():
    # Create a task to update
    pr = client.post("/api/priorities", json={"name": "UpdPriority"}, headers=auth_headers()).json()
    port = client.post("/api/portfolios", json={"name": "UpdPort"}, headers=auth_headers()).json()
    proj = client.post("/api/projects", json={"name": "UpdProj", "portfolio_id": port["id"]}, headers=auth_headers()).json()
    sec = client.post("/api/sections", json={"name": "UpdSec", "project_id": proj["id"]}, headers=auth_headers()).json()
    task = client.post("/api/tasks", json={"name":"Orig","priority_id":pr["id"],"portfolio_id":port["id"],"project_id":proj["id"],"section_id":sec["id"]}, headers=auth_headers()).json()
    tid = task["id"]
    # Update name and description
    upd = {"name":"Updated","description":"Desc"}
    resp = client.put(f"/api/tasks/{tid}", json=upd, headers=auth_headers())
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Updated"
    assert data.get("description") == "Desc"
    # Fetch to confirm
    get = client.get(f"/api/tasks/{tid}", headers=auth_headers()).json()
    assert get["name"] == "Updated"
    assert get.get("description") == "Desc"

def test_delete_task_endpoint():
    # Create and then delete a task
    pr = client.post("/api/priorities", json={"name": "DelPriority"}, headers=auth_headers()).json()
    port = client.post("/api/portfolios", json={"name": "DelPort"}, headers=auth_headers()).json()
    proj = client.post("/api/projects", json={"name": "DelProj", "portfolio_id": port["id"]}, headers=auth_headers()).json()
    sec = client.post("/api/sections", json={"name": "DelSec", "project_id": proj["id"]}, headers=auth_headers()).json()
    task = client.post("/api/tasks", json={"name": "ToDelete", "priority_id": pr["id"], "portfolio_id": port["id"], "project_id": proj["id"], "section_id": sec["id"]}, headers=auth_headers()).json()
    tid = task["id"]
    # Delete
    resp = client.delete(f"/api/tasks/{tid}", headers=auth_headers())
    assert resp.status_code == 204
    # Ensure it's gone
    resp2 = client.get(f"/api/tasks/{tid}", headers=auth_headers())
    assert resp2.status_code == 404

def test_task_advanced_filters():
    portfolio = client.post("/api/portfolios", json={"name": "FilterPortfolio"}, headers=auth_headers()).json()
    project = client.post("/api/projects", json={"name": "FilterProject", "portfolio_id": portfolio["id"]}, headers=auth_headers()).json()
    section = client.post("/api/sections", json={"name": "FilterSection", "project_id": project["id"]}, headers=auth_headers()).json()
    priority = client.post("/api/priorities", json={"name": "FilterPriority"}, headers=auth_headers()).json()
    tag = client.post("/api/tags", json={"name": "FilterTag"}, headers=auth_headers()).json()
    # Create tasks with various values
    t1 = client.post("/api/tasks", json={
        "name": "Task1",
        "portfolio_id": portfolio["id"],
        "project_id": project["id"],
        "section_id": section["id"],
        "priority_id": priority["id"],
        "ai_workflow_status": "Open",
        "assignee": "Jakub",
        "type": "Task",
        "task_type": "Bug",
        "created_at": date(2024, 4, 10).isoformat(),
        "completed_at": date(2024, 4, 12).isoformat(),
        "last_modified_at": date(2024, 4, 13).isoformat(),
    }, headers=auth_headers()).json()
    t2 = client.post("/api/tasks", json={
        "name": "Task2",
        "portfolio_id": portfolio["id"],
        "project_id": project["id"],
        "section_id": section["id"],
        "priority_id": priority["id"],
        "ai_workflow_status": "Closed",
        "assignee": "Anna",
        "type": "Task",
        "task_type": "Feature",
        "created_at": date(2024, 4, 11).isoformat(),
        "completed_at": date(2024, 4, 14).isoformat(),
        "last_modified_at": date(2024, 4, 15).isoformat(),
    }, headers=auth_headers()).json()
    # Attach tag to t1 (now just update the string field)
    t1_id = t1["id"]
    # Instead of TaskTagLink, update the task's tags string directly
    resp = client.patch(f"/api/tasks/{t1_id}", json={"tags": "FilterTag"}, headers=auth_headers())
    assert resp.status_code == 200
    # Filter by status
    resp = client.get(f"/api/tasks?status=Open", headers=auth_headers())
    assert resp.status_code == 200
    assert any(task["name"] == "Task1" for task in resp.json())
    # Filter by assignee
    resp = client.get(f"/api/tasks?assignee=Anna", headers=auth_headers())
    assert resp.status_code == 200
    assert any(task["name"] == "Task2" for task in resp.json())
    # Filter by created_at_after
    resp = client.get(f"/api/tasks?created_at_after=2024-04-10", headers=auth_headers())
    assert resp.status_code == 200
    print("created_at_after=2024-04-10", [task["name"] for task in resp.json()])
    assert any(task["name"] == "Task2" for task in resp.json())
    # Filter by tag
    resp = client.get(f"/api/tasks?tag=FilterTag", headers=auth_headers())
    assert resp.status_code == 200
    assert any(task["name"] == "Task1" for task in resp.json())
    # Filter by task_type
    resp = client.get(f"/api/tasks?task_type=Bug", headers=auth_headers())
    assert resp.status_code == 200
    assert any(task["name"] == "Task1" for task in resp.json())
    # Filter by type
    resp = client.get(f"/api/tasks?type=Task", headers=auth_headers())
    assert resp.status_code == 200
    assert len([task for task in resp.json() if task["name"] in ("Task1","Task2")]) == 2
    # Filter by completed_at_before
    resp = client.get(f"/api/tasks?completed_at_before=2024-04-13", headers=auth_headers())
    assert resp.status_code == 200
    assert any(task["name"] == "Task1" for task in resp.json())
    # Filter by last_modified_at_after
    resp = client.get(f"/api/tasks?last_modified_at_after=2024-04-14", headers=auth_headers())
    assert resp.status_code == 200
    assert any(task["name"] == "Task2" for task in resp.json())

def test_update_show_all_details_fields():
    # Create lookup options for AI integration fields
    df = client.post("/api/desired-output-formats", json={"name": "Fmt1"}, headers=auth_headers()).json()
    ap = client.post("/api/ai-action-process-dropdown", json={"name": "Proc1"}, headers=auth_headers()).json()
    aws = client.post("/api/ai-workflow-statuses", json={"name": "AWS1"}, headers=auth_headers()).json()
    dst = client.post("/api/desired-style-tones", json={"name": "DST1"}, headers=auth_headers()).json()
    abu = client.post("/api/ai-behavior-on-uncertainties", json={"name": "ABU1"}, headers=auth_headers()).json()
    acl = client.post("/api/ai-creativity-levels", json={"name": "ACL1"}, headers=auth_headers()).json()
    app = client.post("/api/ai-processing-priorities", json={"name": "APP1"}, headers=auth_headers()).json()
    # Create dependencies
    portfolio = client.post("/api/portfolios", json={"name": "PortTest"}, headers=auth_headers()).json()
    project = client.post("/api/projects", json={"name": "ProjTest", "portfolio_id": portfolio["id"]}, headers=auth_headers()).json()
    section = client.post("/api/sections", json={"name": "SecTest", "project_id": project["id"]}, headers=auth_headers()).json()
    priority = client.post("/api/priorities", json={"name": "PrioTest"}, headers=auth_headers()).json()
    # Create parent task
    parent = client.post("/api/tasks", json={
        "name": "ParentTask",
        "portfolio_id": portfolio["id"],
        "project_id": project["id"],
        "section_id": section["id"],
        "priority_id": priority["id"]
    }, headers=auth_headers()).json()
    # Create a task
    task = client.post("/api/tasks", json={
        "name": "FullDetailTask",
        "portfolio_id": portfolio["id"],
        "project_id": project["id"],
        "section_id": section["id"],
        "priority_id": priority["id"]
    }, headers=auth_headers()).json()
    tid = task["id"]
    # Update extended fields
    updates = {
        "task_id": "CustomID123",
        "allow_autonomous_execution": True,
        "number_of_variations": 3,
        "ai_agent_status_log": "TestLog",
        "ai_output_result_link": "http://test",
        "desired_output_format_id": df["id"],
        "ai_action_process_dropdown_id": ap["id"],
        "ai_workflow_status_id": aws["id"],
        "desired_style_tone_id": dst["id"],
        "ai_behavior_on_uncertainty_id": abu["id"],
        "ai_creativity_level_id": acl["id"],
        "ai_processing_priority_id": app["id"],
        "specific_constraints_instructions": "Constraints",
        "ai_action_process_free_text": "FreeText",
        "ai_brainstorm_ideas": "Brainstorm",
        "parent_task_id": parent["id"]
    }
    resp = client.put(f"/api/tasks/{tid}", json=updates, headers=auth_headers())
    assert resp.status_code == 200
    data = resp.json()
    for k, v in updates.items():
        assert data.get(k) == v
    # Retrieve to confirm persistence
    gett = client.get(f"/api/tasks/{tid}", headers=auth_headers()).json()
    for k, v in updates.items():
        assert gett.get(k) == v
