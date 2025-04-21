import pytest
from fastapi.testclient import TestClient
from main import app as winds_app

client = TestClient(winds_app)

FIELDS = [
    "desired_output_format",
    "ai_action_process_dropdown",
    "ai_workflow_status",
    "allow_autonomous_execution",
    "desired_style_tone",
    "ai_behavior_on_uncertainty",
    "ai_creativity_level",
    "ai_processing_priority",
    "parent_task_id",
    "ai_brainstorm_ideas",
    "action_required_from_user",
    "related_portfolios",
    "related_projects",
    "related_sections",
    "related_tasks",
    "related_tasks_id",
    "related_entities",
    "target_audience"
]

def test_save_all_ai_and_related_fields():
    # Create a new task
    response = client.post("/api/tasks", json={"name": "Save All Fields Task"}, auth=("jakub", "cerulik123"))
    assert response.status_code == 200
    tid = response.json()["id"]
    patch_data = {
        "desired_output_format": ["PDF", "DOCX"],
        "ai_action_process_dropdown": ["Summarize", "Translate"],
        "ai_workflow_status": ["In Progress", "Waiting"],
        "allow_autonomous_execution": True,
        "desired_style_tone": ["Formal", "Conversational"],
        "ai_behavior_on_uncertainty": ["Ask User", "Skip"],
        "ai_creativity_level": ["High", "Medium"],
        "ai_processing_priority": ["Urgent", "Normal"],
        "parent_task_id": 2,
        "ai_brainstorm_ideas": "Try alternative approaches",
        "action_required_from_user": "Approve output",
        "related_portfolios": ["PortfolioX", "PortfolioY"],
        "related_projects": ["ProjectY", "ProjectZ"],
        "related_sections": ["SectionZ", "SectionA"],
        "related_tasks": "Task A, Task B",
        "related_tasks_id": "42,43",
        "related_entities": "Entity1,Entity2",
        "target_audience": "Students"
    }
    response = client.patch(f"/api/tasks/{tid}", json=patch_data, auth=("jakub", "cerulik123"))
    assert response.status_code == 200
    data = response.json()
    for k, v in patch_data.items():
        if isinstance(v, list):
            assert str(data.get(k, "")).startswith(str(v[0]))
        else:
            assert str(data.get(k, "")).startswith(str(v).split(",")[0])
    # Clean up
    client.delete(f"/api/tasks/{tid}", auth=("jakub", "cerulik123"))

def test_save_all_ai_and_related_fields_edge():
    # Edge: empty, null, or missing fields
    response = client.post("/api/tasks", json={"name": "Edge Save All Fields"}, auth=("jakub", "cerulik123"))
    assert response.status_code == 200
    tid = response.json()["id"]
    patch_data = {f: [] if f not in ["parent_task_id"] else None for f in FIELDS}
    patch_data["parent_task_id"] = None
    response = client.patch(f"/api/tasks/{tid}", json=patch_data, auth=("jakub", "cerulik123"))
    assert response.status_code == 200
    data = response.json()
    for k in FIELDS:
        assert data.get(k, None) in ("", None, False)
    client.delete(f"/api/tasks/{tid}", auth=("jakub", "cerulik123"))
