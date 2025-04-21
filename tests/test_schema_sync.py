import json
import pytest
import sys
import os

# Ensure project root is in sys.path for model import
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from models import Task

CANONICAL_JSON = os.path.join(os.path.dirname(__file__), 'canonical_task_fields.json')

# Fields that are config-only in TS and not real DB fields
IGNORE_CANONICAL = {
    'label', 'type', 'options', 'editable', 'multi', 'getOptions', 'description'
}
# Fields that are backend-only (not in canonical config)
IGNORE_BACKEND = {
    'notes', 'task_goal', 'ai_brainstorm_ideas', 'ai_action_process_dropdown_id', 'ai_workflow_status_id',
    'ai_creativity_level_id', 'ai_behavior_on_uncertainty_id', 'ai_processing_priority_id',
    'updated_at', 'id'
}

@pytest.fixture(scope='module')
def canonical_fields():
    with open(CANONICAL_JSON, encoding='utf-8') as f:
        data = json.load(f)
    # Remove config-only keys
    return set(k for k in data.keys() if k not in IGNORE_CANONICAL)

def test_task_model_fields_vs_canonical(canonical_fields):
    """
    Ensure backend Task model fields match canonical config exactly, ignoring config-only and backend-only fields.
    If mismatch, print actionable diff.
    """
    model_fields = set(Task.__fields__.keys())
    model_fields -= IGNORE_BACKEND
    only_in_canonical = canonical_fields - model_fields
    only_in_model = model_fields - canonical_fields
    msg = ''
    if only_in_canonical:
        msg += f"\nFields ONLY in canonical config (TS): {sorted(only_in_canonical)}"
    if only_in_model:
        msg += f"\nFields ONLY in backend model: {sorted(only_in_model)}"
    assert not only_in_canonical and not only_in_model, (
        f"Schema drift detected!{msg}\nPlease review and update either the backend model or the canonical config."
    )
