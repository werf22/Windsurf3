import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_update_task_ai_fields():
    # Create a new task first
    response = client.post("/api/tasks", json={
        "name": "Test Save AI Fields",
        "description": "desc"
    }, auth=("jakub", "cerulik123"))
    assert response.status_code == 200
    task = response.json()
    tid = task["id"]

    # Update AI and related fields
    patch_data = {
        "ai_action_process_dropdown": "Option1,Option2",
        "ai_workflow_status": "Status1",
        "allow_autonomous_execution": True,
        "desired_style_tone": "Style1,Style2",
        "ai_behavior_on_uncertainty": "Behavior1",
        "ai_creativity_level": "Level1",
        "ai_processing_priority": "Priority1",
        "parent_task_id": 0,
        "ai_brainstorm_ideas": "Some ideas",
        "action_required_from_user": "None",
        "related_portfolios": "Portfolio1",
        "related_projects": "Project1",
        "related_sections": "Section1",
        "related_tasks": "TaskX",
        "related_tasks_id": "ID123",
        "related_entities": "EntityX",
        "target_audience": "AudienceY"
    }
    response = client.patch(f"/api/tasks/{tid}", json=patch_data, auth=("jakub", "cerulik123"))
    assert response.status_code == 200
    data = response.json()
    for k, v in patch_data.items():
        assert str(data.get(k, "")).startswith(str(v).split(",")[0])

    # Clean up
    client.delete(f"/api/tasks/{tid}", auth=("jakub", "cerulik123"))

def test_update_task_ai_fields_edge():
    # Try updating with empty/missing fields
    response = client.post("/api/tasks", json={"name": "Edge AI Fields"}, auth=("jakub", "cerulik123"))
    assert response.status_code == 200
    tid = response.json()["id"]
    patch_data = {"ai_action_process_dropdown": "", "ai_workflow_status": None}
    response = client.patch(f"/api/tasks/{tid}", json=patch_data, auth=("jakub", "cerulik123"))
    assert response.status_code == 200
    data = response.json()
    assert data["ai_action_process_dropdown"] == ""
    assert data["ai_workflow_status"] in (None, "")
    client.delete(f"/api/tasks/{tid}", auth=("jakub", "cerulik123"))
