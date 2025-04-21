import pytest
from frontend.src.components.taskFieldConfig import TASK_FIELD_CONFIG

def test_priority_id_options():
    """
    Test that the options for the 'priority_id' field match exactly what is in the documentation.
    """
    expected_options = ['Low', 'Medium', 'High']
    actual_options = TASK_FIELD_CONFIG['priority_id'].get('options')
    assert actual_options == expected_options, f"priority_id options mismatch: {actual_options} != {expected_options}"
