#!/usr/bin/env python3
"""
Sync missing Task model fields into taskFieldConfig.ts as stubs.
"""
import ast, re, sys
from pathlib import Path

# Paths
task = Path(__file__).resolve().parent.parent
en_models = task / 'models.py'
en_config = task / 'frontend/src/components/taskFieldConfig.ts'

# Parse Task model fields
source = en_models.read_text(encoding='utf-8')
tree = ast.parse(source)
model_fields = set()
for node in tree.body:
    if isinstance(node, ast.ClassDef) and node.name == 'Task':
        for b in node.body:
            if isinstance(b, ast.AnnAssign) and isinstance(b.target, ast.Name):
                model_fields.add(b.target.id)

# Parse existing config keys
text = en_config.read_text(encoding='utf-8')
# capture keys like "  key: {"
config_keys = set(re.findall(r'^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*\{', text, re.MULTILINE))

# Determine missing
missing = model_fields - config_keys
if not missing:
    print('No missing keys in taskFieldConfig.ts')
    sys.exit(0)

# Prepare stubs
def stub_for(key):
    return (
        f"  {key}: {{\n"
        f"    label: '{key}',\n"
        f"    type: 'text',\n"
        f"    editable: true,\n"
        f"    description: ''\n"
        f"  }},\n"
    )

stubs = ''.join(stub_for(k) for k in sorted(missing))

# Insert before last "};"
lines = text.splitlines()
for i in range(len(lines)-1, -1, -1):
    if lines[i].strip() == '};':
        idx = i
        break
else:
    print('Could not find closing }; in config file')
    sys.exit(1)

new = lines[:idx] + [stubs] + lines[idx:]
en_config.write_text("\n".join(new), encoding='utf-8')
print(f"Added {len(missing)} stub keys: {sorted(missing)}")
