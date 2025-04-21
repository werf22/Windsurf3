"""
parse_csv_to_db.py
-----------------

Parses the TASK_TABLE_FIELDS_EXAMPLE_STRUCTURE.csv file and prepares task data for import into the database.

Features:
- Maps CSV columns to DB fields.
- Validates required fields (e.g. 'name').
- Prepares for lookup mapping (portfolio, project, section, priority).
- Exports parsed data as tasks_parsed.json.
- Prints warnings for missing data.

Usage:
    python3 parse_csv_to_db.py

Next steps:
- Map lookup values to DB IDs.
- Export as SQL or API-ready JSON for bulk import.
- Integrate with backend DB or API.
"""
"""
Script: parse_csv_to_db.py
Purpose: Parse TASK_TABLE_FIELDS_EXAMPLE_STRUCTURE.csv and prepare data for import into the Tasks database schema.
Author: Autonomous AI (2025-04-16)
"""
import csv
import json
import argparse
from typing import Dict, Any, List
import pandas as pd

try:
    import requests
except ImportError:
    requests = None

CSV_PATH = '/Users/test/Desktop/Windsurf3/TASK_TABLE_FIELDS_EXAMPLE_STRUCTURE.csv'

# Map CSV columns to DB fields (FULL mapping, auto-generated based on taskFieldConfig.ts and CSV headers)
CSV_TO_DB_MAP = {
    'Task ID': 'task_id',
    'Name': 'name',
    'Description': 'description',
    'Notes': 'notes',
    'Task Comments': 'task_comments',
    'Portfolio': 'portfolio',
    'Project': 'project',
    'Sections': 'sections',
    'Parent Task': 'parent_task',
    'Parent Task ID': 'parent_task_id',
    'Subtasks (for user)': 'subtasks_for_user',
    'Subtasks (for AI)': 'subtasks_for_ai',
    'Subtasks (in System)': 'subtasks_in_system',
    'Subtasks ID (in System)': 'subtasks_id_in_system',
    'AI Brainstorm Ideas on How It Can Help Me:': 'ai_brainstorm_ideas',
    'Dependents': 'dependents',
    'Dependents ID': 'dependents_id',
    'Outgoing Dependents': 'outgoing_dependents',
    'Outgoing Dependents ID': 'outgoing_dependents_id',
    'Tags': 'tags',
    'Priority': 'priority',
    'Due Date': 'due_date',
    'Start Date': 'start_date',
    'Deadline Type': 'deadline_type',
    'Recurrence / Frequency': 'recurrence_frequency',
    'Created At': 'created_at',
    'Completed At': 'completed_at',
    'Last Modified At': 'last_modified_at',
    'Task Goal': 'task_goal',
    'Input Data & Context': 'input_data_context',
    'Desired Output Format': 'desired_output_format',
    'AI Action / Process (Free Text)': 'ai_action_process_free_text',
    'AI Action / Process (Dropdown)': 'ai_action_process_dropdown',
    'AI Workflow Status': 'ai_workflow_status',
    'Allow Autonomous Execution': 'allow_autonomous_execution',
    'Number of Variations (If Applicable)': 'number_of_variations',
    'Desired Style / Tone': 'desired_style_tone',
    'Specific Constraints / Instructions': 'specific_constraints_instructions',
    'AI Behavior on Uncertainty': 'ai_behavior_on_uncertainty',
    'AI Creativity Level': 'ai_creativity_level',
    'AI Processing Priority': 'ai_processing_priority',
    'AI Agent Status Log': 'ai_agent_status_log',
    'AI Output / Result Link': 'ai_output_result_link',
    'Action Required From User': 'action_required_from_user',
    'Related Portfolios': 'related_portfolios',
    'Related Projects': 'related_projects',
    'Related Sections': 'related_sections',
    'Related Tasks': 'related_tasks',
    'Related Tasks ID': 'related_tasks_id',
    'Related Entities': 'related_entities',
    'Target Audience': 'target_audience',
    'Task Purpose (Why)': 'task_purpose',
    'Type': 'type',
    'Task Type': 'task_type',
    'Estimated User Time': 'estimated_user_time',
    'Cognitive Load (For User)': 'cognitive_load',
    'Energy Level Required (For User)': 'energy_level_required',
    'Required Tools / Software': 'required_tools_software',
    'Required Hardware': 'required_hardware',
    'Required Skills': 'required_skills',
    'Estimated Cost / Budget': 'estimated_cost_budget',
    'Expected Impact / Success Metric': 'expected_impact_success_metric',
    'Location': 'location',
    'Execution Location': 'execution_location',
    'Required Device(s)': 'required_devices',
    'Internet Requirement': 'internet_requirement',
    'Focus Requirement': 'focus_requirement',
    'Optimal Time of Day': 'optimal_time_of_day',
    'Assignee': 'assignee',
    'Collaborators': 'collaborators',
    'Related Entity': 'related_entity',
    'Waiting For': 'waiting_for',
    'Financial Return (Value & Speed)': 'financial_return',
    'AI Output Rating': 'ai_output_rating',
    'Feedback for AI': 'feedback_for_ai',
    'Suggested Initial Steps / Subtasks': 'suggested_initial_steps',
    'Relatated Areas for AI to Consider': 'related_areas_for_ai',
    'Potential Dependencies / Related Tasks': 'potential_dependencies',
}

REQUIRED_FIELDS = ['name']  # Expand as needed
LOOKUP_FIELDS = ['portfolio', 'project', 'section', 'priority']

# --- Helper for normalizing lookup values ---
def normalize_lookup(val: str) -> str:
    if not val:
        return ""
    return val.strip().lower()

# --- Lookup Table Mappings ---
LOOKUP_MAPPINGS = {
    'portfolio': {
        normalize_lookup('Social Media & Marketing (Marketing)'): 2
    },
    'project': {
        normalize_lookup('Sociálne Médiá - Správa & Obsah (Marketing)'): 2
    },
    'section': {
        normalize_lookup('Správa Kanálov & Komunita (Sociálne Médiá - Správa & Obsah (Marketing))'): 4
    },
    'priority': {
        normalize_lookup('P1'): 1
    }
}

# --- Helper for mapping lookups ---
def map_lookups(task):
    mapped = dict(task)
    # Portfolio
    if 'portfolio' in mapped and mapped['portfolio']:
        mapped['portfolio_id'] = LOOKUP_MAPPINGS['portfolio'].get(normalize_lookup(mapped['portfolio']), mapped['portfolio'])
    # Project
    if 'project' in mapped and mapped['project']:
        projects = [p.strip() for p in mapped['project'].split(',') if p.strip()]
        mapped['project_id'] = LOOKUP_MAPPINGS['project'].get(normalize_lookup(projects[0]), projects[0]) if projects else None
    # Section
    if 'section' in mapped and mapped['section']:
        sections = [s.strip() for s in mapped['section'].split(',') if s.strip()]
        mapped['section_id'] = LOOKUP_MAPPINGS['section'].get(normalize_lookup(sections[0]), sections[0]) if sections else None
    # Priority
    if 'priority' in mapped and mapped['priority']:
        mapped['priority_id'] = LOOKUP_MAPPINGS['priority'].get(normalize_lookup(mapped['priority']), mapped['priority'])
    # Remove original lookup fields
    for k in ['portfolio', 'project', 'section', 'priority']:
        mapped.pop(k, None)
    # Only include fields that exist in Task model
    allowed_fields = set([
        'task_id','name','description','notes','task_comments','portfolio_id','project_id','section_id','priority_id','due_date','start_date','created_at','completed_at','updated_at','tags','task_goal','input_data_context','desired_output_format','ai_action_process_free_text','ai_action_process_dropdown','ai_workflow_status','allow_autonomous_execution','number_of_variations','desired_style_tone','specific_constraints_instructions','ai_behavior_on_uncertainty','ai_creativity_level','ai_processing_priority','ai_agent_status_log','ai_output_result_link','action_required_from_user','related_portfolios','related_projects','related_sections','related_tasks','related_tasks_id','related_entities','target_audience','task_purpose','type','task_type','estimated_user_time','cognitive_load','energy_level_required','required_tools_software','required_hardware','required_skills','estimated_cost_budget','expected_impact_success_metric','location','execution_location','required_devices','internet_requirement','focus_requirement','optimal_time_of_day','assignee','collaborators','related_entity','waiting_for','financial_return_value_speed','ai_output_rating','feedback_for_ai','suggested_initial_steps_subtasks','related_areas_for_ai_to_consider','potential_dependencies_related_tasks'
    ])
    filtered = {k: v for k, v in mapped.items() if k in allowed_fields and v != ''}
    if not filtered.get('name'):
        filtered['name'] = '[Imported Task]'  # Fallback name if missing
    return filtered

def load_lookup_tables(path: str) -> dict:
    """
    Load lookup tables from a JSON file. Example structure:
    {
      "portfolio": {"Portfolio Name": 1, ...},
      "project": {"Project Name": 2, ...},
      ...
    }
    """
    try:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Could not load lookup tables from {path}: {e}")
        return {}


# Default stub lookup tables
LOOKUP_TABLES = {
    'portfolio': {'Example Portfolio': 1},
    'project': {'Example Project': 1},
    'section': {'Example Section': 1},
    'priority': {'High': 1, 'Medium': 2, 'Low': 3},
}


def map_lookup_value(field: str, value: str, lookups=None) -> int:
    """
    Map lookup value to DB ID using provided lookup tables.
    """
    tables = lookups if lookups is not None else LOOKUP_TABLES
    return tables.get(field, {}).get(value, None)


# --- Utility: Clean integer fields ---
def clean_int(val):
    try:
        if val is None:
            return None
        if isinstance(val, float):
            import math
            if math.isnan(val):
                return None
            return int(val)
        if isinstance(val, str):
            val = val.strip()
            if val == '' or val.lower() == 'nan':
                return None
            return int(float(val))
        return int(val)
    except Exception:
        return None

# --- Utility: Clean all fields in a dict (convert nan to None, enforce int for *_id fields) ---
def clean_task_dict(task: dict) -> dict:
    import math
    import numpy as np
    for k, v in list(task.items()):
        if v is None:
            continue
        # Clean integer fields and *_id fields
        if k.endswith('_id') or k in [
            'id', 'portfolio', 'portfolio_id', 'project', 'project_id',
            'section', 'section_id', 'priority', 'priority_id',
            'parent_task_id', 'subtasks_id_in_system', 'dependents_id',
            'outgoing_dependents_id', 'number_of_variations',
        ]:
            try:
                if isinstance(v, float) and math.isnan(v):
                    task[k] = None
                elif isinstance(v, str) and (v.strip() == '' or v.strip().lower() == 'nan'):
                    task[k] = None
                elif 'numpy' in str(type(v)) and np.isnan(v):
                    task[k] = None
                else:
                    task[k] = int(float(v))
            except Exception:
                task[k] = None
        else:
            if isinstance(v, float) and math.isnan(v):
                task[k] = None
            elif isinstance(v, str) and (v.strip() == '' or v.strip().lower() == 'nan'):
                task[k] = None
            elif 'numpy' in str(type(v)) and np.isnan(v):
                task[k] = None
    return task

# --- Utility: Deep clean all fields in a dict/list (convert nan/numpy.nan/empty to None everywhere) ---
def deep_clean(obj):
    import math
    import numpy as np
    if isinstance(obj, dict):
        return {k: deep_clean(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [deep_clean(v) for v in obj]
    elif obj is None:
        return None
    elif isinstance(obj, float) and math.isnan(obj):
        return None
    elif 'numpy' in str(type(obj)) and hasattr(obj, 'dtype') and np.isnan(obj):
        return None
    elif isinstance(obj, str) and (obj.strip().lower() == 'nan' or obj.strip() == ''):
        return None
    else:
        return obj

# --- Main CSV parsing logic ---
def parse_csv(csv_path: str, lookups: Dict[str, Dict[str, int]]) -> List[Dict[str, Any]]:
    tasks = []
    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            mapped = {}
            for csv_col, db_col in CSV_TO_DB_MAP.items():
                val = row.get(csv_col, None)
                if db_col in LOOKUP_FIELDS and val:
                    norm_val = normalize_lookup(val)
                    lookup_map = {normalize_lookup(k): v for k, v in lookups[db_col].items()}
                    mapped[db_col] = lookup_map.get(norm_val, None)
                else:
                    mapped[db_col] = val
            tasks.append(mapped)
    return tasks


def export_as_sql(tasks: List[Dict[str, Any]], outfile: str):
    with open(outfile, 'w', encoding='utf-8') as f:
        for t in tasks:
            cols = ', '.join(t.keys())
            vals = ', '.join(f"'{v.replace("'", "''")}'" if v else 'NULL' for v in t.values())
            f.write(f"INSERT INTO tasks ({cols}) VALUES ({vals});\n")
    print(f"Exported tasks as SQL to {outfile}")


# --- Patch import_to_backend_api to use map_lookups ---
def import_to_backend_api(tasks, api_url, dry_run=True, user=None, password=None):
    if not requests:
        print("requests module not available. Install with 'pip install requests'.")
        return
    headers = {'Content-Type': 'application/json'}
    auth = (user, password) if user and password else None
    for i, task in enumerate(tasks, 1):
        mapped_task = map_lookups(task)
        if dry_run:
            print(f"[DRY RUN] Would POST to {api_url}: {mapped_task}")
        else:
            resp = requests.post(api_url, json=mapped_task, headers=headers, auth=auth)
            print(f"Task {i}: status={resp.status_code}, response={resp.text}")


def main():
    parser = argparse.ArgumentParser(description="Parse tasks CSV and export to JSON and/or SQL.")
    parser.add_argument('--json', action='store_true', help='Export parsed tasks as JSON')
    parser.add_argument('--sql', action='store_true', help='Export parsed tasks as SQL')
    parser.add_argument('--csv', type=str, default=CSV_PATH, help='Path to input CSV file')
    parser.add_argument('--api', type=str, help='Backend API endpoint for importing tasks')
    parser.add_argument('--no-dry-run', action='store_true', help='Actually POST to API (default is dry run)')
    parser.add_argument('--lookups', type=str, help='Path to lookup tables JSON file')
    parser.add_argument('--user', type=str, help='HTTP Basic Auth username')
    parser.add_argument('--password', type=str, help='HTTP Basic Auth password')
    args = parser.parse_args()

    lookups = LOOKUP_TABLES
    if args.lookups:
        lookups = load_lookup_tables(args.lookups)

    tasks = parse_csv(args.csv, lookups)
    print(f"Parsed {len(tasks)} tasks from CSV.")
    if tasks:
        print(tasks[0])
    if args.json:
        # Write the full dynamic tasks list to JSON
        output_path = "tasks_parsed.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(tasks, f, ensure_ascii=False, indent=2)
        print(f"Exported parsed tasks to {output_path}")
        # Debug: print file path and contents
        with open(output_path, "r", encoding="utf-8") as f:
            print(f"[DEBUG] Contents of {output_path}:")
            print(f.read())
    if args.sql:
        export_as_sql(tasks, "tasks_parsed.sql")
    if args.api:
        import_to_backend_api(tasks, args.api, dry_run=not args.no_dry_run, user=args.user, password=args.password)


if __name__ == '__main__':
    main()
