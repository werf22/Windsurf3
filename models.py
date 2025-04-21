from typing import Optional
from datetime import datetime, date
from sqlmodel import SQLModel, Field
from pydantic import BaseModel, EmailStr

# --- User Model ---
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: EmailStr = Field(index=True, unique=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserRead(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime

class UserLogin(BaseModel):
    username: str
    password: str

# --- Task Model (Canonical: matches taskFieldConfig.ts & canonical_task_fields.json, DATA FIELDS ONLY) ---
class Task(SQLModel, table=True):
    task_id: Optional[int] = Field(default=None, primary_key=True)
    name: Optional[str] = None
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    last_modified_at: Optional[datetime] = None
    assignee: Optional[str] = None
    due_date: Optional[date] = None
    start_date: Optional[date] = None
    parent_task_id: Optional[str] = None
    parent_task: Optional[str] = None
    tags: Optional[str] = None
    task_comments: Optional[str] = None
    portfolio_id: Optional[str] = None
    project_id: Optional[str] = None
    section_id: Optional[str] = None
    priority_id: Optional[str] = None
    subtasks_in_system: Optional[str] = None
    dependents: Optional[str] = None
    dependents_id: Optional[str] = None
    outgoing_dependents: Optional[str] = None
    outgoing_dependents_id: Optional[str] = None
    task_purpose: Optional[str] = None
    task_type: Optional[str] = None
    estimated_user_time: Optional[str] = None
    cognitive_load: Optional[str] = None
    energy_level_required: Optional[str] = None
    required_tools_software: Optional[str] = None
    required_hardware: Optional[str] = None
    required_skills: Optional[str] = None
    estimated_cost_budget: Optional[str] = None
    expected_impact_success_metric: Optional[str] = None
    location: Optional[str] = None
    execution_location: Optional[str] = None
    required_devices: Optional[str] = None
    internet_requirement: Optional[str] = None
    focus_requirement: Optional[str] = None
    optimal_time_of_day: Optional[str] = None
    collaborators: Optional[str] = None
    related_entity: Optional[str] = None
    waiting_for: Optional[str] = None
    financial_return_value_speed: Optional[str] = None
    ai_output_rating: Optional[str] = None
    feedback_for_ai: Optional[str] = None
    suggested_initial_steps_subtasks: Optional[str] = None
    related_areas_for_ai_to_consider: Optional[str] = None
    potential_dependencies_related_tasks: Optional[str] = None
    deadline_type: Optional[str] = None
    recurrence_frequency: Optional[str] = None
    input_data_context: Optional[str] = None
    desired_output_format: Optional[str] = None
    ai_action_process_free_text: Optional[str] = None
    ai_action_process_dropdown: Optional[str] = None
    ai_workflow_status: Optional[str] = None
    allow_autonomous_execution: Optional[bool] = None
    number_of_variations: Optional[int] = None
    desired_style_tone: Optional[str] = None
    specific_constraints_instructions: Optional[str] = None
    ai_behavior_on_uncertainty: Optional[str] = None
    ai_creativity_level: Optional[str] = None
    ai_processing_priority: Optional[str] = None
    ai_agent_status_log: Optional[str] = None
    ai_output_result_link: Optional[str] = None
    subtasks_for_user: Optional[str] = None
    subtasks_for_ai: Optional[str] = None
    subtasks_id_in_system: Optional[str] = None
    ai_brainstorm_ideas_on_how_it_can_help_me: Optional[str] = None
    action_required_from_user: Optional[str] = None
    related_portfolios: Optional[str] = None
    related_projects: Optional[str] = None
    related_sections: Optional[str] = None
    related_tasks: Optional[str] = None
    related_tasks_id: Optional[str] = None
    related_entities: Optional[str] = None
    target_audience: Optional[str] = None
    # Config-only fields (label, type, editable, description, options, multi, getOptions) are intentionally omitted from the DB model.

# --- End of models ---
