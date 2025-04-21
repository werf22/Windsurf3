import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// --- DYNAMIC FIELD CONFIGURATION ---
// CSV fields from TASK_TABLE_FIELDS_EXAMPLE_STRUCTURE.csv
const CSV_FIELDS = [
  "Task ID","Name","Description","Notes","Task Comments","Portfolio","Project","Sections","Parent Task","Parent Task ID","Subtasks (for user)","Subtasks (for AI)","Subtasks (in System)","Subtasks ID (in System)","AI Brainstorm Ideas on How It Can Help Me:","Dependents","Dependents ID","Outgoing Dependents","Outgoing Dependents ID","Tags","Priority","Due Date","Start Date","Deadline Type","Recurrence / Frequency","Created At","Completed At","Last Modified At","Task Goal","Input Data & Context","Desired Output Format","AI Action / Process (Free Text)","AI Action / Process (Dropdown)","AI Workflow Status","Allow Autonomous Execution","Number of Variations (If Applicable)","Desired Style / Tone","Specific Constraints / Instructions","AI Behavior on Uncertainty","AI Creativity Level","AI Processing Priority","AI Agent Status Log","AI Output / Result Link","Action Required From User","Related Portfolios","Related Projects","Related Sections","Related Tasks","Related Tasks ID","Related Entities","Target Audience","Task Purpose (Why)","Type","Task Type","Estimated User Time","Cognitive Load (For User)","Energy Level Required (For User)","Required Tools / Software","Required Hardware","Required Skills","Estimated Cost / Budget","Expected Impact / Success Metric","Location","Execution Location","Required Device(s)","Internet Requirement","Focus Requirement","Optimal Time of Day","Assignee","Collaborators","Related Entity","Waiting For","Financial Return (Value & Speed)","AI Output Rating","Feedback for AI","Suggested Initial Steps / Subtasks","Relatated Areas for AI to Consider","Potential Dependencies / Related Tasks"
];
const FIELD_MAP = CSV_FIELDS.map(f => f
  .replace(/\s*\([^)]*\)/g, "")
  .replace(/[^a-zA-Z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '')
  .replace(/_+/g, '_')
  .toLowerCase()
);

// Build a unique field-label mapping preserving order
const FIELD_LABEL_MAP: { field: string; label: string }[] = [];
const seen = new Set<string>();
for (let i = 0; i < FIELD_MAP.length; ++i) {
  const field = FIELD_MAP[i];
  if (!seen.has(field)) {
    // Patch: For the 'priority' field, force label to 'Priority filter (priority)'
    if (field === 'priority') {
      FIELD_LABEL_MAP.push({ field, label: 'Priority filter (priority)' });
    } else {
      FIELD_LABEL_MAP.push({ field, label: `${CSV_FIELDS[i]} filter (${field})` });
    }
    seen.add(field);
  }
}

// --- ENUMERATED AND BOOLEAN FIELD OPTIONS ---
const ENUM_FIELD_OPTIONS: Record<string, string[]> = {
  priority: ["P1", "P2", "P3", "Low", "Medium", "High"],
  deadline_type: ["Hard", "Soft", "None"],
  recurrence_frequency: ["None", "Daily", "Weekly", "Monthly", "Yearly"],
  ai_action_process_dropdown: ["Summarize", "Write", "Research", "Classify", "Other"],
  ai_workflow_status: ["Not Started", "In Progress", "Done", "Blocked", "Waiting", "Error"],
  ai_creativity_level: ["Low", "Medium", "High"],
  ai_processing_priority: ["Low", "Medium", "High"],
  focus_requirement: ["Low", "Medium", "High"],
  type: ["Task", "Bug", "Feature", "Idea"],
  task_type: ["Meeting", "Coding", "Writing", "Review", "Other"],
  ai_output_rating: ["1", "2", "3", "4", "5"],
};
const BOOLEAN_FIELD_OPTIONS: Record<string, string[]> = {
  allow_autonomous_execution: ["Yes", "No"],
  action_required_from_user: ["Yes", "No"],
  internet_requirement: ["Yes", "No"],
};

interface Option {
  id: number;
  name: string;
}

interface TaskFilterProps {
  filters: { [key: string]: string };
  onFiltersChange: (filters: { [key: string]: string }) => void;
  debounceMs?: number;
}

export const TaskFilter: React.FC<TaskFilterProps> = ({ filters, onFiltersChange, debounceMs = 300 }) => {
  const [options, setOptions] = useState({});
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [priorityOptions, setPriorityOptions] = useState<Option[]>([]);
  const [portfolioOptions, setPortfolioOptions] = useState<Option[]>([]);
  const [projectOptions, setProjectOptions] = useState<Option[]>([]);
  const [sectionOptions, setSectionOptions] = useState<Option[]>([]);
  const [statusOptions, setStatusOptions] = useState<Option[]>([]);
  const [tagOptions, setTagOptions] = useState<Option[]>([]);
  const [assigneeOptions, setAssigneeOptions] = useState<Option[]>([]);
  const [deadlineTypeOptions, setDeadlineTypeOptions] = useState<string[]>([]);
  const [recurrenceFrequencyOptions, setRecurrenceFrequencyOptions] = useState<string[]>([]);

  useEffect(() => {
    axios.get("/api/priorities").then(res => setPriorityOptions(res.data));
    axios.get("/api/portfolios").then(res => setPortfolioOptions(res.data));
    axios.get("/api/projects").then(res => setProjectOptions(res.data));
    axios.get("/api/sections").then(res => setSectionOptions(res.data));
    axios.get("/api/statuses").then(res => setStatusOptions(res.data));
    axios.get("/api/tags").then(res => setTagOptions(res.data));
    axios.get("/api/assignees").then(res => setAssigneeOptions(res.data));
    axios.get("/api/deadline-types").then(res => setDeadlineTypeOptions(res.data)).catch(() => {});
    axios.get("/api/recurrence-frequencies").then(res => setRecurrenceFrequencyOptions(res.data)).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onFiltersChange(newFilters), debounceMs);
  };

  const renderFilter = (field: string, i: number, visibleLabel: string) => {
    const labelText = visibleLabel || field;
    const filterId = `filter-${field}`;

    if (field === 'portfolio') {
      return (
        <div key={field} style={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
          <label htmlFor={filterId}>{labelText}</label>
          <select
            id={filterId}
            name={field}
            aria-label={labelText}
            value={filters[field] || ""}
            onChange={handleChange}
            style={{ width: '100%' }}
          >
            <option value="">All</option>
            {portfolioOptions.map(opt => (
              <option key={opt.id} value={opt.id.toString()}>{opt.name}</option>
            ))}
          </select>
        </div>
      );
    } else if (field === 'project') {
      return (
        <div key={field} style={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
          <label htmlFor={filterId}>{labelText}</label>
          <select
            id={filterId}
            name={field}
            aria-label={labelText}
            value={filters[field] || ""}
            onChange={handleChange}
            style={{ width: '100%' }}
          >
            <option value="">All</option>
            {projectOptions.map(opt => (
              <option key={opt.id} value={opt.id.toString()}>{opt.name}</option>
            ))}
          </select>
        </div>
      );
    } else if (field === 'section') {
      return (
        <div key={field} style={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
          <label htmlFor={filterId}>{labelText}</label>
          <select
            id={filterId}
            name={field}
            aria-label={labelText}
            value={filters[field] || ""}
            onChange={handleChange}
            style={{ width: '100%' }}
          >
            <option value="">All</option>
            {sectionOptions.map(opt => (
              <option key={opt.id} value={opt.id.toString()}>{opt.name}</option>
            ))}
          </select>
        </div>
      );
    } else if (field === 'priority') {
      return (
        <div key={field} style={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
          <label htmlFor={filterId}>{labelText}</label>
          <select
            id={filterId}
            name={field}
            aria-label={labelText}
            value={filters[field] || ""}
            onChange={handleChange}
            style={{ width: '100%' }}
          >
            <option value="">All</option>
            {priorityOptions.map(opt => (
              <option key={opt.id} value={opt.id.toString()}>{opt.name}</option>
            ))}
          </select>
        </div>
      );
    } else if (field === 'assignee') {
      return (
        <div key={field} style={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
          <label htmlFor={filterId}>{labelText}</label>
          <select
            id={filterId}
            name={field}
            aria-label={labelText}
            value={filters[field] || ""}
            onChange={handleChange}
            style={{ width: '100%' }}
          >
            <option value="">All</option>
            {assigneeOptions.map(opt => (
              <option key={opt.id} value={opt.name}>{opt.name}</option>
            ))}
          </select>
        </div>
      );
    } else if (field === 'deadline_type') {
      return (
        <div key={field} style={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
          <label htmlFor={filterId}>{labelText}</label>
          <select
            id={filterId}
            name={field}
            aria-label={labelText}
            value={filters[field] || ""}
            onChange={handleChange}
            style={{ width: '100%' }}
          >
            <option value="">All</option>
            {deadlineTypeOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    } else if (field === 'recurrence_frequency') {
      return (
        <div key={field} style={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
          <label htmlFor={filterId}>{labelText}</label>
          <select
            id={filterId}
            name={field}
            aria-label={labelText}
            value={filters[field] || ""}
            onChange={handleChange}
            style={{ width: '100%' }}
          >
            <option value="">All</option>
            {recurrenceFrequencyOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    } else if (field === 'tags') {
      return (
        <div key={field} style={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
          <label htmlFor={`filter-${field}`}>{visibleLabel || field}</label>
          <select
            id={`filter-${field}`}
            name={field}
            aria-label={visibleLabel || field}
            value={filters[field] || ''}
            onChange={handleChange}
            style={{ width: '100%' }}
          >
            <option value="">All</option>
            {tagOptions.map(opt => (
              <option key={opt.name} value={opt.name}>{opt.name}</option>
            ))}
          </select>
        </div>
      );
    } else if (ENUM_FIELD_OPTIONS[field]) {
      return (
        <div key={field} style={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
          <label htmlFor={filterId}>{labelText}</label>
          <select
            id={filterId}
            name={field}
            aria-label={labelText}
            value={filters[field] || ""}
            onChange={handleChange}
            style={{ width: '100%' }}
          >
            <option value="">All</option>
            {ENUM_FIELD_OPTIONS[field].map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    } else if (BOOLEAN_FIELD_OPTIONS[field]) {
      return (
        <div key={field} style={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
          <label htmlFor={filterId}>{labelText}</label>
          <select
            id={filterId}
            name={field}
            aria-label={labelText}
            value={filters[field] || ""}
            onChange={handleChange}
            style={{ width: '100%' }}
          >
            <option value="">All</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      );
    } else if (field.includes('date')) {
      return (
        <div key={field} style={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
          <label htmlFor={filterId}>{labelText}</label>
          <input
            id={filterId}
            name={field}
            type="date"
            aria-label={labelText}
            value={filters[field] || ''}
            onChange={handleChange}
            style={{ width: '100%' }}
          />
        </div>
      );
    } else {
      return (
        <div key={field} style={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
          <label htmlFor={filterId}>{labelText}</label>
          <input
            id={filterId}
            name={field}
            aria-label={labelText}
            value={filters[field] || ''}
            onChange={handleChange}
            placeholder={`Filter ${visibleLabel}`}
            style={{ width: '100%' }}
          />
        </div>
      );
    }
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, maxHeight: 240, overflowY: 'auto', border: '1px solid #eee', padding: 8, marginBottom: 12 }}>
      {FIELD_LABEL_MAP.map(({field, label}, i) => renderFilter(field, i, label))}
    </div>
  );
};
