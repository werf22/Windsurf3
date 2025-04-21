import React, { useState, useEffect } from "react";
import axios from "axios";
import { Task } from "./TaskTable";
import { Notification } from "./Notification";

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

// Utility: ensure unique keys for React
function getUniqueFieldKeys(fields: string[]): string[] {
  const seen = new Map<string, number>();
  return fields.map(f => {
    const count = seen.get(f) || 0;
    seen.set(f, count + 1);
    return count === 0 ? f : `${f}_${count}`;
  });
}
const UNIQUE_FIELD_KEYS = getUniqueFieldKeys(FIELD_MAP);

interface TaskRowProps {
  task: Task;
  onUpdate: () => void;
  auth: { username: string; password: string };
}

interface TaskRowFields {
  [key: string]: string | number | null | undefined;
}

export const TaskRow: React.FC<TaskRowProps> = ({ task, onUpdate, auth }) => {
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState<TaskRowFields>(() => {
    const initial: TaskRowFields = {};
    UNIQUE_FIELD_KEYS.forEach((field, i) => {
      const value = (task as any)[field];
      initial[field] = value !== undefined ? value : "";
    });
    return initial;
  });
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Helper to get axios config with auth header
  const axiosAuthConfig = () => ({
    headers: {
      Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`)
    },
    withCredentials: true
  });

  const handleChange = (field: string, value: string) => {
    setFields(f => ({ ...f, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setNotif(null);
    try {
      // Only send fields that have changed and are not empty strings
      const payload: Record<string, any> = {};
      Object.keys(fields).forEach(key => {
        if (fields[key] !== (task as any)[key] && fields[key] !== "") {
          // Convert to number if original was a number
          if (typeof (task as any)[key] === "number") {
            payload[key] = Number(fields[key]);
          } else {
            payload[key] = fields[key];
          }
        }
      });
      await axios.patch(`/api/tasks/${task.id}`, payload, axiosAuthConfig());
      setNotif({ msg: "Task updated!", type: "success" });
      setEditing(false);
      onUpdate();
    } catch {
      setNotif({ msg: "Failed to update task", type: "error" });
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this task?")) return;
    setLoading(true);
    try {
      await axios.delete(`/api/tasks/${task.id}`, axiosAuthConfig());
      onUpdate();
    } finally {
      setLoading(false);
    }
  };

  if (editing) {
    return <>
      {UNIQUE_FIELD_KEYS.map(field => (
        <td key={field}>
          <input
            value={fields[field] ?? ""}
            onChange={e => handleChange(field, e.target.value)}
            style={{ width: '100%' }}
          />
        </td>
      ))}
      <td>
        <button onClick={handleSave} disabled={loading}>Save</button>
        <button onClick={() => setEditing(false)} disabled={loading}>Cancel</button>
        {notif && <Notification message={notif.msg} type={notif.type} />}
      </td>
      <td>
        <button onClick={handleDelete} disabled={loading}>Delete</button>
      </td>
    </>;
  }

  return <>
    {UNIQUE_FIELD_KEYS.map(field => (
      <td key={field}>{(task as any)[field] !== undefined ? String((task as any)[field]) : ""}</td>
    ))}
    <td>
      <button onClick={() => setEditing(true)}>Edit</button>
      <button onClick={handleDelete} disabled={loading}>Delete</button>
      {notif && <Notification message={notif.msg} type={notif.type} />}
    </td>
  </>;
};
