import json
import os
import re

TS_CONFIG_PATH = os.path.join(os.path.dirname(__file__), '../frontend/src/components/taskFieldConfig.ts')
EXPORT_JSON_PATH = os.path.join(os.path.dirname(__file__), '../tests/canonical_task_fields.json')

# --- Robust parser for all field names in TASK_FIELD_CONFIG ---
def extract_fields(ts_path):
    fields = {}
    with open(ts_path, encoding='utf-8') as f:
        content = f.read()
    # Find the TASK_FIELD_CONFIG object (from its export line to the closing };)
    m = re.search(r'export const TASK_FIELD_CONFIG\s*=\s*{(.|\n)+?^};', content, re.MULTILINE)
    if not m:
        # Try fallback: greedy match up to last occurrence of '};'
        start = content.find('export const TASK_FIELD_CONFIG')
        if start == -1:
            raise ValueError('TASK_FIELD_CONFIG not found')
        after = content[start:]
        end = after.rfind('};')
        if end == -1:
            raise ValueError('TASK_FIELD_CONFIG closing not found')
        config_body = after[after.find('{')+1:end]
    else:
        config_body = m.group(0)
    # Find all top-level keys (field names) at the start of a line
    for field in re.finditer(r'(^|\n)\s*([a-zA-Z0-9_]+)\s*:', config_body):
        field_name = field.group(2)
        fields[field_name] = {}
    return fields

if __name__ == '__main__':
    fields = extract_fields(TS_CONFIG_PATH)
    with open(EXPORT_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(fields, f, ensure_ascii=False, indent=2)
    print(f"Exported {len(fields)} fields to {EXPORT_JSON_PATH}")
