import os
import pytest
import requests
import time
from requests.auth import HTTPBasicAuth

USERNAME = "jakub"
PASSWORD = "cerulik123"


def test_backend_logging_file_exists():
    """
    Test that the backend_debug.log file is created after a task operation.
    """
    # Remove log file if it exists
    if os.path.exists('backend_debug.log'):
        os.remove('backend_debug.log')
    # Trigger a backend operation (create a task)
    payload = {"name": "Test Logging Task", "description": "Log test"}
    response = requests.post(
        "http://localhost:8000/api/tasks",
        json=payload,
        auth=HTTPBasicAuth(USERNAME, PASSWORD)
    )
    time.sleep(1)
    assert os.path.exists('backend_debug.log'), "backend_debug.log was not created."

def test_backend_logging_content():
    """
    Test that backend_debug.log contains expected log lines after a PATCH request.
    """
    # Assume a task with id 1 exists
    patch_payload = {"description": "Updated log test"}
    response = requests.patch(
        "http://localhost:8000/api/tasks/1",
        json=patch_payload,
        auth=HTTPBasicAuth(USERNAME, PASSWORD)
    )
    time.sleep(1)
    assert os.path.exists('backend_debug.log'), "backend_debug.log was not created."
    with open('backend_debug.log', 'r') as f:
        log_content = f.read()
    assert "PATCH /api/tasks/1 called with update" in log_content, "PATCH log line missing."
    assert "PATCH /api/tasks/1 response" in log_content, "PATCH response log line missing."

def test_backend_logging_error_case():
    """
    Test that backend_debug.log logs errors for invalid PATCH requests.
    """
    # Patch non-existent task
    patch_payload = {"description": "Should fail"}
    response = requests.patch(
        "http://localhost:8000/api/tasks/99999",
        json=patch_payload,
        auth=HTTPBasicAuth(USERNAME, PASSWORD)
    )
    time.sleep(1)
    with open('backend_debug.log', 'r') as f:
        log_content = f.read()
    assert "Task 99999 not found for patch" in log_content or "Exception in PATCH /api/tasks/99999" in log_content, "Error log for missing task not found."
