#!/usr/bin/env python3
"""
Script to add missing columns to the Task table from taskFieldConfig.ts definitions.
This ensures all fields in the frontend have corresponding database columns.
"""

import sys
import os
import sqlite3
from sqlalchemy import text
from main import engine

# List of all AI fields that should be direct columns in the database
FIELDS_TO_ADD = [
    # AI-related fields that should be direct columns
    ('desired_output_format', 'TEXT'),
    ('ai_action_process_free_text', 'TEXT'),
    ('ai_action_process_dropdown', 'TEXT'),
    ('ai_workflow_status', 'TEXT'),
    ('allow_autonomous_execution', 'BOOLEAN'),
    ('number_of_variations', 'INTEGER'),
    ('desired_style_tone', 'TEXT'),
    ('specific_constraints_instructions', 'TEXT'),
    ('ai_behavior_on_uncertainty', 'TEXT'),
    ('ai_creativity_level', 'TEXT'),
    ('ai_processing_priority', 'TEXT'),
    ('ai_agent_status_log', 'TEXT'),
    ('ai_output_result_link', 'TEXT'),
    ('ai_brainstorm_ideas', 'TEXT'),
    # Additional recently added fields
    ('action_required_from_user', 'TEXT'),
    ('related_portfolios', 'TEXT'),
    ('related_projects', 'TEXT'),
    ('related_sections', 'TEXT'),
    ('related_tasks', 'TEXT'),
    ('related_tasks_id', 'TEXT'),
    ('related_entities', 'TEXT'),
    ('target_audience', 'TEXT')
]

def add_columns():
    """Add missing columns to the task table."""
    print("Adding missing columns to the Task table...")
    
    with engine.connect() as conn:
        # Get existing columns
        result = conn.execute(text("PRAGMA table_info(task)"))
        existing_columns = [row[1] for row in result.fetchall()]
        print(f"Existing columns: {existing_columns}")
        
        # Add missing columns
        columns_added = []
        for column_name, column_type in FIELDS_TO_ADD:
            if column_name not in existing_columns:
                try:
                    sql = f"ALTER TABLE task ADD COLUMN {column_name} {column_type}"
                    conn.execute(text(sql))
                    conn.commit()
                    columns_added.append(column_name)
                    print(f"Added column: {column_name} ({column_type})")
                except Exception as e:
                    print(f"Error adding column {column_name}: {e}")
            else:
                print(f"Column already exists: {column_name}")
        
        if columns_added:
            print(f"Added {len(columns_added)} columns: {columns_added}")
        else:
            print("No columns needed to be added.")

if __name__ == "__main__":
    add_columns()
    print("Done")
