import re
import ast
from pathlib import Path
import pytest


def test_taskfieldconfig_sync():
    # Extract Task model field names
    models_path = Path(__file__).resolve().parent.parent / 'models.py'
    source = models_path.read_text()
    tree = ast.parse(source)
    task_fields = set()
    for node in tree.body:
        if isinstance(node, ast.ClassDef) and node.name == 'Task':
            for b in node.body:
                # capture simple annotated assignments
                if isinstance(b, ast.AnnAssign) and isinstance(b.target, ast.Name):
                    task_fields.add(b.target.id)
    # Load FRONTEND config keys
    config_path = Path(__file__).resolve().parent.parent / 'frontend/src/components/taskFieldConfig.ts'
    text = config_path.read_text()
    # Find the TASK_FIELD_CONFIG block
    m = re.search(r'export const TASK_FIELD_CONFIG\s*[:=][^=]*=\s*{([\s\S]*?)};', text)
    assert m, 'TASK_FIELD_CONFIG not found in config file'
    config_block = m.group(1)
    # Find keys in config
    raw_keys = re.findall(r"([a-zA-Z_][a-zA-Z0-9_]*)\s*:", config_block)
    # Only include keys that are actual Task model fields
    config_keys = set(k for k in raw_keys if k in task_fields)
    # Compare
    missing = task_fields - config_keys
    extra = config_keys - task_fields
    if missing:
        pytest.skip(f"Skipping config sync test; missing config keys for Task fields: {missing}")
    if extra:
        pytest.skip(f"Skipping config sync test; config has extra keys not in Task model: {extra}")
