import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Task } from "./TaskTable";
import { Notification } from "./Notification";

interface Option {
  id: number;
  name: string;
}

interface TaskFormProps {
  onSuccess?: () => void;
  auth: { username: string; password: string };
}

interface AISuggestions {
  portfolio?: string;
  project?: string;
  section?: string;
  tags?: string;
  [key: string]: string | undefined;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSuccess, auth }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priorityId, setPriorityId] = useState("");
  const [portfolioId, setPortfolioId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [priorityOptions, setPriorityOptions] = useState<Option[]>([]);
  const [portfolioOptions, setPortfolioOptions] = useState<Option[]>([]);
  const [projectOptions, setProjectOptions] = useState<Option[]>([]);
  const [sectionOptions, setSectionOptions] = useState<Option[]>([]);
  const [tagsOptions, setTagsOptions] = useState<Option[]>([]);
  const [tasksOptions, setTasksOptions] = useState<Option[]>([]);
  const [relatedPortfolios, setRelatedPortfolios] = useState<number[]>([]);
  const [relatedProjects, setRelatedProjects] = useState<number[]>([]);
  const [relatedSections, setRelatedSections] = useState<number[]>([]);
  const [relatedTasks, setRelatedTasks] = useState<number[]>([]);
  // --- AI suggestion state ---
  const [aiSuggestLoading, setAiSuggestLoading] = useState(false);
  const [aiSuggestError, setAiSuggestError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Helper to get axios config with auth header
  const axiosAuthConfig = () => ({
    headers: {
      Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`)
    },
    withCredentials: true
  });

  useEffect(() => {
    axios.get("/api/priorities", axiosAuthConfig()).then(res => setPriorityOptions(res.data));
    axios.get("/api/portfolios", axiosAuthConfig()).then(res => setPortfolioOptions(res.data));
    axios.get("/api/projects", axiosAuthConfig()).then(res => setProjectOptions(res.data));
    axios.get("/api/sections", axiosAuthConfig()).then(res => setSectionOptions(res.data));
    axios.get("/api/tags", axiosAuthConfig()).then(res => setTagsOptions(res.data));
    axios.get("/api/tasks", axiosAuthConfig()).then(res => setTasksOptions(res.data));
  }, [auth]);

  // --- AI suggestion logic ---
  useEffect(() => {
    if (!name.trim() && !description.trim()) {
      setAiSuggestions(null);
      setAiSuggestError(null);
      setAiSuggestLoading(false);
      return;
    }
    // Debounce AI call
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setAiSuggestLoading(true);
      setAiSuggestError(null);
      try {
        const resp = await axios.post(
          "/api/ai-categorize",
          { name, description, due_date: dueDate },
          axiosAuthConfig()
        );
        setAiSuggestions(resp.data);
      } catch (err: any) {
        setAiSuggestError("AI suggestion failed");
        setAiSuggestions(null);
      }
      setAiSuggestLoading(false);
    }, 700);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [name, description, dueDate, auth]);

  const handleAcceptSuggestion = (field: string) => {
    if (!aiSuggestions || !aiSuggestions[field]) return;
    if (field === "priority_id") setPriorityId(String(aiSuggestions[field]));
    if (field === "portfolio_id") setPortfolioId(String(aiSuggestions[field]));
    if (field === "project_id") setProjectId(String(aiSuggestions[field]));
    if (field === "section_id") setSectionId(String(aiSuggestions[field]));
    if (field === "tags") setTags(aiSuggestions[field].split(','));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.post("/api/tasks", {
        name,
        description,
        due_date: dueDate || null,
        priority_id: priorityId ? Number(priorityId) : aiSuggestions?.priority_id || null,
        portfolio_id: portfolioId ? Number(portfolioId) : aiSuggestions?.portfolio_id || null,
        project_id: projectId ? Number(projectId) : aiSuggestions?.project_id || null,
        section_id: sectionId ? Number(sectionId) : aiSuggestions?.section_id || null,
        tags: tags.length ? tags : (aiSuggestions?.tags ? aiSuggestions?.tags.split(',') : []),
        related_portfolios: relatedPortfolios,
        related_projects: relatedProjects,
        related_sections: relatedSections,
        related_tasks: relatedTasks
      }, axiosAuthConfig());
      setName("");
      setDescription("");
      setDueDate("");
      setPriorityId("");
      setPortfolioId("");
      setProjectId("");
      setSectionId("");
      setTags([]);
      setRelatedPortfolios([]);
      setRelatedProjects([]);
      setRelatedSections([]);
      setRelatedTasks([]);
      setAiSuggestions(null);
      setSuccess("Task created successfully!");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to create task");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Create Task Form" style={{ margin: "2em 0", padding: 16, border: "1px solid #eee", maxWidth: 500 }}>
      <h3>Create New Task</h3>
      {success && <Notification message={success} type="success" />}
      {error && <Notification message={error} type="error" />}
      <div>
        <label htmlFor="taskform-name">Name *</label>
        <input id="taskform-name" value={name} onChange={e => setName(e.target.value)} required style={{ width: "100%" }} />
      </div>
      <div>
        <label htmlFor="taskform-desc">Description</label>
        <input id="taskform-desc" value={description} onChange={e => setDescription(e.target.value)} style={{ width: "100%" }} />
      </div>
      <div>
        <label htmlFor="taskform-due">Due Date</label>
        <input id="taskform-due" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ width: "100%" }} />
      </div>
      <div>
        <label htmlFor="taskform-priority">Priority</label>
        <select id="taskform-priority" value={priorityId || aiSuggestions?.priority_id || ""} onChange={e => setPriorityId(e.target.value)} style={{ width: "100%" }}>
          <option value="">-- Select --</option>
          {priorityOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
        {aiSuggestions?.priority_id && !priorityId && (
          <button type="button" style={{ marginLeft: 8, fontSize: 12 }} onClick={() => handleAcceptSuggestion("priority_id")}>Accept AI suggestion</button>
        )}
      </div>
      <div>
        <label htmlFor="taskform-portfolio">Portfolio</label>
        <select id="taskform-portfolio" value={portfolioId || aiSuggestions?.portfolio_id || ""} onChange={e => setPortfolioId(e.target.value)} style={{ width: "100%" }}>
          <option value="">-- Select --</option>
          {portfolioOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
        {aiSuggestions?.portfolio_id && !portfolioId && (
          <button type="button" style={{ marginLeft: 8, fontSize: 12 }} onClick={() => handleAcceptSuggestion("portfolio_id")}>Accept AI suggestion</button>
        )}
      </div>
      <div>
        <label htmlFor="taskform-project">Project</label>
        <select id="taskform-project" value={projectId || aiSuggestions?.project_id || ""} onChange={e => setProjectId(e.target.value)} style={{ width: "100%" }}>
          <option value="">-- Select --</option>
          {projectOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
        {aiSuggestions?.project_id && !projectId && (
          <button type="button" style={{ marginLeft: 8, fontSize: 12 }} onClick={() => handleAcceptSuggestion("project_id")}>Accept AI suggestion</button>
        )}
      </div>
      <div>
        <label htmlFor="taskform-section">Section</label>
        <select id="taskform-section" value={sectionId || aiSuggestions?.section_id || ""} onChange={e => setSectionId(e.target.value)} style={{ width: "100%" }}>
          <option value="">-- Select --</option>
          {sectionOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
        {aiSuggestions?.section_id && !sectionId && (
          <button type="button" style={{ marginLeft: 8, fontSize: 12 }} onClick={() => handleAcceptSuggestion("section_id")}>Accept AI suggestion</button>
        )}
      </div>
      <div>
        <label htmlFor="taskform-tags">Tags</label>
        <select
          id="taskform-tags"
          multiple
          value={tags}
          onChange={e => {
            const selected = Array.from(e.target.selectedOptions).map(o => o.value);
            setTags(selected);
          }}
          style={{ width: "100%", height: 100 }}
        >
          {tagsOptions.map(opt => (
            <option key={opt.id} value={opt.name}>{opt.name}</option>
          ))}
        </select>
        {aiSuggestions?.tags && !tags.length && (
          <button type="button" style={{ marginLeft: 8, fontSize: 12 }} onClick={() => handleAcceptSuggestion("tags")}>Accept AI suggestion</button>
        )}
      </div>
      <div>
        <label htmlFor="taskform-related-portfolios">Related Portfolios</label>
        <select
          id="taskform-related-portfolios"
          multiple
          value={relatedPortfolios.map(String)}
          onChange={e => {
            const vals = Array.from(e.target.selectedOptions).map(o => Number(o.value));
            setRelatedPortfolios(vals);
          }}
          style={{ width: "100%", height: 100 }}
        >
          {portfolioOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="taskform-related-projects">Related Projects</label>
        <select
          id="taskform-related-projects"
          multiple
          value={relatedProjects.map(String)}
          onChange={e => {
            const vals = Array.from(e.target.selectedOptions).map(o => Number(o.value));
            setRelatedProjects(vals);
          }}
          style={{ width: "100%", height: 100 }}
        >
          {projectOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="taskform-related-sections">Related Sections</label>
        <select
          id="taskform-related-sections"
          multiple
          value={relatedSections.map(String)}
          onChange={e => {
            const vals = Array.from(e.target.selectedOptions).map(o => Number(o.value));
            setRelatedSections(vals);
          }}
          style={{ width: "100%", height: 100 }}
        >
          {sectionOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="taskform-related-tasks">Related Tasks</label>
        <select
          id="taskform-related-tasks"
          multiple
          value={relatedTasks.map(String)}
          onChange={e => {
            const vals = Array.from(e.target.selectedOptions).map(o => Number(o.value));
            setRelatedTasks(vals);
          }}
          style={{ width: "100%", height: 100 }}
        >
          {tasksOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
      </div>
      {aiSuggestLoading && <div style={{ color: '#888', fontSize: 13 }}>AI suggesting fields...</div>}
      {aiSuggestError && <div style={{ color: 'red', fontSize: 13 }}>{aiSuggestError}</div>}
      <button type="submit" disabled={loading || !name.trim()} style={{ marginTop: 8 }}>
        {loading ? "Creating..." : "Create Task"}
      </button>
    </form>
  );
};
