import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box, 
  Button, 
  Flex, 
  Heading, 
  Input, 
  Select, 
  Textarea, 
  Text, 
  Divider, 
  useColorModeValue, 
  Spinner, 
  Alert, 
  AlertIcon, 
  Avatar, 
  VStack, 
  HStack,
  Grid,
  GridItem,
  Badge,
  IconButton,
  Tooltip,
  Tag,
  useToast,
  FormControl,
  FormLabel,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  TagLabel,
  TagCloseButton
} from "@chakra-ui/react";
import { FiArrowLeft, FiSend, FiSave, FiEdit, FiCalendar, FiTag, FiList, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { TaskDetailSubtasks } from "./TaskDetailSubtasks";
import { TASK_FIELD_CONFIG, TaskFieldConfig, PORTFOLIO_PROJECT_SECTION } from "./taskFieldConfig";
import type { ErrorInfo } from "react";
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';

// List of all Task model fields (sync with backend)
const ALL_TASK_FIELDS = [
  "id", "task_id", "name", "description", "notes", "task_comments", "portfolio_id", "project_id", "section_id", "priority_id", "parent_task_id", "due_date", "start_date", "created_at", "completed_at", "last_modified_at", "task_purpose", "type", "task_type", "estimated_user_time", "cognitive_load", "energy_level_required", "required_tools_software", "required_hardware", "required_skills", "estimated_cost_budget", "expected_impact_success_metric", "location", "execution_location", "required_devices", "internet_requirement", "focus_requirement", "optimal_time_of_day", "assignee", "collaborators", "related_entity", "waiting_for", "financial_return_value_speed", "ai_output_rating", "feedback_for_ai", "suggested_initial_steps_subtasks", "related_areas_for_ai_to_consider", "potential_dependencies_related_tasks", "subtasks_for_user", "subtasks_for_ai", "subtasks_in_system", "subtasks_id_in_system", "ai_brainstorm_ideas", "dependents", "dependents_id", "outgoing_dependents", "outgoing_dependents_id", "tags", "deadline_type", "recurrence_frequency", "input_data_context", "desired_output_format", "ai_action_process_free_text", "ai_action_process_dropdown", "ai_workflow_status", "allow_autonomous_execution", "number_of_variations", "desired_style_tone", "specific_constraints_instructions", "ai_behavior_on_uncertainty", "ai_creativity_level", "ai_processing_priority", "ai_agent_status_log", "ai_output_result_link", "action_required_from_user", "related_portfolios", "related_projects", "related_sections", "related_tasks", "related_tasks_id", "related_entities", "target_audience"
];

interface Task {
  id: number;
  name: string;
  description?: string;
  due_date?: string;
  priority?: string;
  portfolio?: string;
  project?: string;
  sections?: string;
  tags?: string;
  assignee?: string;
  ai_workflow_status?: string;
  created_at?: string;
  completed_at?: string;
  last_modified_at?: string;
  [key: string]: any;
}

interface TaskDetailProps {
  taskId: number;
  auth: { username: string; password: string };
  onBack?: () => void;
  onSaved?: () => void;
}

class TaskDetailErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error("TaskDetail crashed:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <Box p={8} color="red.600" bg="red.50" borderRadius="md" mt={8}>
        <Heading size="md" mb={2}>Task Detail Error</Heading>
        <Text mb={2}>Something went wrong while loading the task detail UI.</Text>
        <Text fontSize="sm" color="red.400">{String(this.state.error)}</Text>
      </Box>;
    }
    return this.props.children;
  }
}

export const TaskDetail: React.FC<TaskDetailProps> = ({ taskId, auth, onBack, onSaved }) => {
  // These UI colors need to be consistent across renders
  const colorMode = useColorModeValue("light", "dark");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const accentColor = useColorModeValue("blue.600", "blue.400");
  const fieldBg = useColorModeValue("gray.50", "gray.700");
  const headerBg = useColorModeValue("gray.50", "gray.800");
  const subtaskBg = useColorModeValue("gray.50", "gray.700");
  const textColorPrimary = useColorModeValue("gray.800", "white");
  const textColorSecondary = useColorModeValue("gray.600", "gray.300");
  const tagBg = useColorModeValue("blue.50", "blue.900");

  const toast = useToast();

  // Task state
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editedTask, setEditedTask] = useState<Task | null>(null);

  // Chat state
  const [chatHistory, setChatHistory] = useState<{ sender: string; message: string; ts?: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Subtask state (from backend)
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [subtasksLoading, setSubtasksLoading] = useState(false);
  const [subtasksError, setSubtasksError] = useState<string | null>(null);

  // Dynamic lookup options
  const [deadlineTypeOptions, setDeadlineTypeOptions] = useState<string[]>([]);
  const [recurrenceOptions, setRecurrenceOptions] = useState<string[]>([]);

  const [showAllFields, setShowAllFields] = useState(false);

  // Guards to prevent duplicate fetches across StrictMode mounts
  let hasLoadedTask = false;
  let hasLoadedChat = false;
  let hasLoadedOptions = false;
  let hasLoadedSubtasks = false;

  useEffect(() => {
    // only load option data when editing, once
    if (!onSaved || hasLoadedOptions) return;
    hasLoadedOptions = true;
    fetch('/api/deadline-types', { headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) } })
      .then(res => res.json())
      .then(data => setDeadlineTypeOptions(Array.isArray(data) ? data : []))
      .catch(() => setDeadlineTypeOptions([]));
  }, [auth, onSaved]);

  const formatFieldName = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b(ai|id|url)\b/gi, (m) => m.toUpperCase())
      .replace(/\b([a-z])/g, (m) => m.toUpperCase())
      .replace(/\s+/g, ' ');
  };

  const isDisplayableField = (key: string) => {
    return ![
      "id", "subtasks", "parent", "chatHistory", "chatInput", "chatLoading", "chatError", "subtasksLoading", "subtasksError"
    ].includes(key);
  };

  // Helper: load and normalize task data
  const loadTask = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/tasks/${taskId}`, { headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) } });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const raw = await resp.json();
      const norm = normalizeTask(raw);
      setTask(norm);
      setEditedTask(norm);
    } catch (err: any) {
      setError('Failed to load task: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasLoadedTask) return;
    hasLoadedTask = true;
    loadTask();
  }, [taskId, auth]);

  useEffect(() => {
    if (hasLoadedChat) return;
    hasLoadedChat = true;
    fetch(`/api/tasks/${taskId}/chat`, {
      method: "GET",
      headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) }
    })
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setChatHistory(data) : setChatHistory([]))
      .catch(() => setChatHistory([]));
  }, [taskId, auth]);

  // Load subtasks from backend using fetch and handle non-array responses
  useEffect(() => {
    // only load subtasks when editing, once
    if (!onSaved || !task || hasLoadedSubtasks) return;
    hasLoadedSubtasks = true;
    setSubtasksLoading(true);
    setSubtasksError(null);
    fetch(`/api/tasks/${task.id}/subtasks`, { headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) } })
      .then(res => res.json())
      .then(data => setSubtasks(Array.isArray(data) ? data : []))
      .catch(() => {
        setSubtasksError("Failed to load subtasks");
        setSubtasks([]);
      })
      .finally(() => setSubtasksLoading(false));
  }, [task, onSaved]);

  useEffect(() => {
    if (task) {
      setEditedTask(normalizeTask(task));
      
      // Add debug logging to see what's in the task initially
      console.log('DEBUG Initial task with AI fields:', {
        id: task.id,
        desired_output_format: task.desired_output_format,
        ai_action_process_free_text: task.ai_action_process_free_text,
        ai_action_process_dropdown: task.ai_action_process_dropdown,
        ai_workflow_status: task.ai_workflow_status,
        allow_autonomous_execution: task.allow_autonomous_execution,
        number_of_variations: task.number_of_variations,
        desired_style_tone: task.desired_style_tone,
        specific_constraints_instructions: task.specific_constraints_instructions,
        ai_behavior_on_uncertainty: task.ai_behavior_on_uncertainty,
        ai_creativity_level: task.ai_creativity_level,
        ai_processing_priority: task.ai_processing_priority,
        ai_agent_status_log: task.ai_agent_status_log,
        ai_output_result_link: task.ai_output_result_link,
        parent_task_id: task.parent_task_id,
        ai_brainstorm_ideas: task.ai_brainstorm_ideas
      });
    }
  }, [task]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type, checked, options } = e.target;
    let newValue: any = value;
    if (type === "checkbox") {
      newValue = checked;
    } else if (type === "select-one" && name.endsWith('_id')) {
      // Convert dropdown IDs to numbers
      newValue = value === '' ? null : parseInt(value, 10);
    } else if (type === "select-multiple" && options) {
      newValue = Array.from(options)
        .filter((o: any) => o.selected)
        .map((o: any) => o.value);
    }
    setEditedTask(prev => prev ? { ...prev, [name]: newValue } : prev);
  };

  const onFieldChange = useCallback(handleChange, [setEditedTask]);

  const handleSave = async () => {
    console.debug('[TaskDetail] Save Changes clicked', { taskId, editedTask });
    if (!editedTask) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    // Prepare payload, properly handling all fields
    const payload: any = { ...editedTask };
    
    // Identify all multi-select fields including AI-related ones
    const multiSelectFields = [
      // Standard fields
      'related_portfolios', 
      'related_projects', 
      'related_sections', 
      'related_tasks', 
      'tags',
      // AI-related fields
      'desired_output_format',
      'desired_style_tone',
      'ai_action_process_dropdown',
      'ai_workflow_status',
      'ai_behavior_on_uncertainty',
      'ai_creativity_level',
      'ai_processing_priority'
    ];
    
    // Ensure all multi-select fields are correctly formatted as CSV strings
    multiSelectFields.forEach(field => {
      if (Array.isArray(payload[field])) {
        payload[field] = payload[field].join(',');
      } else if (payload[field] === undefined || payload[field] === null) {
        // Ensure we send empty string rather than null/undefined for these fields
        payload[field] = '';
      }
    });
    
    // Create a special string version of these fields to send separately
    // These match the expected column names in the database
    if (payload.desired_output_format) {
      payload.desired_output_format_raw = payload.desired_output_format;
    }
    
    if (payload.ai_action_process_dropdown) {
      payload.ai_action_process_dropdown_raw = payload.ai_action_process_dropdown;
    }
    
    if (payload.desired_style_tone) {
      payload.desired_style_tone_raw = payload.desired_style_tone;
    }
    
    if (payload.ai_workflow_status) {
      payload.ai_workflow_status_raw = payload.ai_workflow_status;
    }
    
    if (payload.ai_behavior_on_uncertainty) {
      payload.ai_behavior_on_uncertainty_raw = payload.ai_behavior_on_uncertainty;
    }
    
    if (payload.ai_creativity_level) {
      payload.ai_creativity_level_raw = payload.ai_creativity_level;
    }
    
    if (payload.ai_processing_priority) {
      payload.ai_processing_priority_raw = payload.ai_processing_priority;
    }
    
    // Debug log the AI fields we're trying to update
    console.log('DEBUG handleSave full payload:', payload);
    console.log('DEBUG AI fields being saved:', {
      task_id: payload.task_id,
      desired_output_format: payload.desired_output_format,
      ai_action_process_free_text: payload.ai_action_process_free_text,
      ai_action_process_dropdown: payload.ai_action_process_dropdown,
      ai_workflow_status: payload.ai_workflow_status,
      allow_autonomous_execution: payload.allow_autonomous_execution,
      number_of_variations: payload.number_of_variations,
      desired_style_tone: payload.desired_style_tone,
      specific_constraints_instructions: payload.specific_constraints_instructions,
      ai_behavior_on_uncertainty: payload.ai_behavior_on_uncertainty,
      ai_creativity_level: payload.ai_creativity_level,
      ai_processing_priority: payload.ai_processing_priority,
      ai_agent_status_log: payload.ai_agent_status_log,
      ai_output_result_link: payload.ai_output_result_link,
      parent_task_id: payload.parent_task_id,
      ai_brainstorm_ideas: payload.ai_brainstorm_ideas
    });
    
    try {
      const resp = await fetch(`/api/tasks/${editedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`)
        },
        body: JSON.stringify(payload)
      });
      console.debug('[TaskDetail] Save Changes response', resp);
      if (!resp.ok) {
        const errText = await resp.text();
        console.error('[TaskDetail] Save Changes error', errText);
        throw new Error(errText);
      }
      const data = await resp.json();
      const normSaved = normalizeTask(data);
      setTask(normSaved);
      setEditedTask(normSaved);
      setSuccess('Task updated!');
      onSaved?.();
      
      // Add debug logging to see what's in the task after saving
      console.log('DEBUG Saved task with AI fields:', {
        id: normSaved.id,
        desired_output_format: normSaved.desired_output_format,
        ai_action_process_free_text: normSaved.ai_action_process_free_text,
        ai_action_process_dropdown: normSaved.ai_action_process_dropdown,
        ai_workflow_status: normSaved.ai_workflow_status,
        allow_autonomous_execution: normSaved.allow_autonomous_execution,
        number_of_variations: normSaved.number_of_variations,
        desired_style_tone: normSaved.desired_style_tone,
        specific_constraints_instructions: normSaved.specific_constraints_instructions,
        ai_behavior_on_uncertainty: normSaved.ai_behavior_on_uncertainty,
        ai_creativity_level: normSaved.ai_creativity_level,
        ai_processing_priority: normSaved.ai_processing_priority,
        ai_agent_status_log: normSaved.ai_agent_status_log,
        ai_output_result_link: normSaved.ai_output_result_link,
        parent_task_id: normSaved.parent_task_id,
        ai_brainstorm_ideas: normSaved.ai_brainstorm_ideas
      });
    } catch (err: any) {
      console.error('[TaskDetail] Save Changes error', err, err?.response);
      setError('Failed to save changes: ' + String(err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const onSave = useCallback(handleSave, [editedTask, auth]);

  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMessage = { sender: "user", message: chatInput };
    setChatHistory(prev => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);
    try {
      const resp = await fetch(`/api/tasks/${taskId}/chat`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) },
        body: JSON.stringify({ message: userMessage.message })
      });
      const data = await resp.json();
      if (Array.isArray(data)) setChatHistory(data);
    } catch (err) {
      setChatError("Failed to send message");
    } finally {
      setChatLoading(false);
    }
  };

  // Create subtask using fetch
  const handleAddSubtask = async (data: { name: string; description: string }) => {
    if (!task) return;
    try {
      const res = await fetch(`/api/tasks/${task.id}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) },
        body: JSON.stringify(data)
      });
      const subtask = await res.json();
      setSubtasks(prev => [...prev, subtask]);
    } catch (e: any) {
      setSubtasksError(e?.response?.data?.detail || "Failed to create subtask");
    }
  };

  // Update subtask using fetch
  const handleEditSubtask = async (id: number, data: { name: string; description: string }) => {
    try {
      const res = await fetch(`/api/subtasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) },
        body: JSON.stringify(data)
      });
      const subtask = await res.json();
      setSubtasks(prev => prev.map(s => (s.id === id ? subtask : s)));
    } catch (e: any) {
      setSubtasksError(e?.response?.data?.detail || "Failed to update subtask");
    }
  };

  // Delete subtask using fetch
  const handleDeleteSubtask = async (id: number) => {
    try {
      await fetch(`/api/subtasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) }
      });
      setSubtasks(prev => prev.filter(s => s.id !== id));
    } catch (e: any) {
      setSubtasksError(e?.response?.data?.detail || "Failed to delete subtask");
    }
  };

  // Handler for dynamic field changes (name, value signature)
  const handleDynamicFieldChange = (name: string, value: any) => {
    setEditedTask(prev => prev ? { ...prev, [name]: value } : null);
  };

  // --- Dynamic Field Rendering Helper ---
  function renderTaskField(
    fieldName: string,
    value: any,
    config: TaskFieldConfig,
    onChange: (name: string, value: any) => void,
    extraProps: Record<string, any> = {}
  ) {
    switch (config.type) {
      case 'text':
        return (
          <FormControl key={fieldName} mb={4} isDisabled={!config.editable}>
            <FormLabel htmlFor={fieldName}>{config.label}</FormLabel>
            <Input
              id={fieldName}
              aria-label={config.label}
              value={value || ''}
              onChange={e => onChange(fieldName, e.target.value)}
              {...extraProps}
            />
          </FormControl>
        );
      case 'textarea':
        return (
          <FormControl key={fieldName} mb={4} isDisabled={!config.editable}>
            <FormLabel htmlFor={fieldName}>{config.label}</FormLabel>
            <Textarea
              id={fieldName}
              aria-label={config.label}
              value={value || ''}
              onChange={e => onChange(fieldName, e.target.value)}
              {...extraProps}
            />
          </FormControl>
        );
      case 'dropdown':
        return (
          <FormControl key={fieldName} mb={4} isDisabled={!config.editable}>
            <FormLabel htmlFor={fieldName}>{config.label}</FormLabel>
            <Select
              id={fieldName}
              aria-label={config.label}
              value={value || ''}
              onChange={e => onChange(fieldName, e.target.value)}
              {...extraProps}
            >
              <option value="">Select...</option>
              {(config.options || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Select>
          </FormControl>
        );
      case 'multi-select':
        // Custom multiselect with scrollable dropdown, chips, and remove (x)
        return (
          <FormControl key={fieldName} mb={4} isDisabled={!config.editable}>
            <FormLabel htmlFor={fieldName}>{config.label}</FormLabel>
            <Box minH="38px" borderWidth="1px" borderRadius="md" p={2} bg="white" _dark={{bg: 'gray.700'}}>
              <HStack wrap="wrap" spacing={2} mb={2} minH="32px">
                {Array.isArray(value) && value.length > 0 ? value.map((selected: string) => (
                  <Tag key={selected} size="md" colorScheme="blue">
                    <TagLabel>{selected}</TagLabel>
                    <TagCloseButton onClick={() => {
                      const newArr = value.filter((v: string) => v !== selected);
                      onChange(fieldName, newArr);
                    }} />
                  </Tag>
                )) : <Text color="gray.400" fontSize="sm">No selection</Text>}
              </HStack>
              <Menu>
                <MenuButton as={Button} size="sm" rightIcon={<FiChevronDown />} variant="outline" width="100%">
                  Add option
                </MenuButton>
                <MenuList maxH="200px" overflowY="auto">
                  {(config.options || []).filter(opt => !value?.includes(opt)).map(opt => (
                    <MenuItem key={opt} onClick={() => {
                      const newArr = Array.isArray(value) ? [...value, opt] : [opt];
                      onChange(fieldName, newArr);
                    }}>{opt}</MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </Box>
          </FormControl>
        );
      case 'date':
        return (
          <FormControl key={fieldName} mb={4} isDisabled={!config.editable}>
            <FormLabel htmlFor={fieldName}>{config.label}</FormLabel>
            <Input
              id={fieldName}
              aria-label={config.label}
              type="date"
              value={value || ''}
              onChange={e => onChange(fieldName, e.target.value)}
              {...extraProps}
            />
          </FormControl>
        );
      case 'number':
        return (
          <FormControl key={fieldName} mb={4} isDisabled={!config.editable}>
            <FormLabel htmlFor={fieldName}>{config.label}</FormLabel>
            <Input
              id={fieldName}
              aria-label={config.label}
              type="number"
              value={value || ''}
              onChange={e => onChange(fieldName, e.target.value)}
              {...extraProps}
            />
          </FormControl>
        );
      case 'boolean':
        return (
          <FormControl key={fieldName} mb={4} isDisabled={!config.editable} display="flex" alignItems="center">
            <FormLabel htmlFor={fieldName} mb={0}>{config.label}</FormLabel>
            <Select
              id={fieldName}
              aria-label={config.label}
              value={value === true ? "true" : value === false ? "false" : ''}
              onChange={e => onChange(fieldName, e.target.value === "true" ? true : e.target.value === "false" ? false : null)}
              width="auto"
              ml={2}
              {...extraProps}
            >
              <option value="">Select...</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          </FormControl>
        );
      case 'portfolio_id': {
        // Portfolio multi-select (canonical keys only)
        const portfolioOptions = Object.keys(PORTFOLIO_PROJECT_SECTION);
        // Defensive: filter out any invalid portfolio values
        const validValue = Array.isArray(value) ? value.filter(v => portfolioOptions.includes(v)) : [];
        return (
          <FormControl key={fieldName} mb={4} isDisabled={!config.editable}>
            <FormLabel htmlFor={fieldName}>{config.label}</FormLabel>
            <Box minH="38px" borderWidth="1px" borderRadius="md" p={2} bg="white" _dark={{bg: 'gray.700'}}>
              <HStack wrap="wrap" spacing={2} mb={2} minH="32px">
                {validValue.length > 0 ? validValue.map((selected: string) => (
                  <Tag key={selected} size="md" colorScheme="blue">
                    <TagLabel>{selected}</TagLabel>
                    <TagCloseButton onClick={() => {
                      const newArr = validValue.filter((v: string) => v !== selected);
                      onChange(fieldName, newArr);
                      onChange('project_id', []);
                      onChange('section_id', []);
                    }} />
                  </Tag>
                )) : <Text color="gray.400" fontSize="sm">No selection</Text>}
              </HStack>
              <Menu>
                <MenuButton as={Button} size="sm" rightIcon={<FiChevronDown />} variant="outline" width="100%">
                  Add option
                </MenuButton>
                <MenuList maxH="200px" overflowY="auto">
                  {portfolioOptions.filter(opt => !validValue.includes(opt)).map(opt => (
                    <MenuItem key={opt} onClick={() => {
                      const newArr = [...validValue, opt];
                      onChange(fieldName, newArr);
                      onChange('project_id', []);
                      onChange('section_id', []);
                    }}>{opt}</MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </Box>
          </FormControl>
        );
      }
      case 'project_id': {
        // Project options depend on selected portfolio(s)
        const pfArr = Array.isArray(editedTask?.portfolio_id) ? editedTask.portfolio_id.filter((p: string) => Object.keys(PORTFOLIO_PROJECT_SECTION).includes(p)) : [];
        let projects: string[] = pfArr.flatMap((pf: string) => Object.keys(PORTFOLIO_PROJECT_SECTION[pf] || {}));
        projects = Array.from(new Set(projects));
        const validValue = Array.isArray(value) ? value.filter(v => projects.includes(v)) : [];
        return (
          <FormControl key={fieldName} mb={4} isDisabled={!config.editable || pfArr.length === 0}>
            <FormLabel htmlFor={fieldName}>{config.label}</FormLabel>
            <Box minH="38px" borderWidth="1px" borderRadius="md" p={2} bg="white" _dark={{bg: 'gray.700'}}>
              <HStack wrap="wrap" spacing={2} mb={2} minH="32px">
                {validValue.length > 0 ? validValue.map((selected: string) => (
                  <Tag key={selected} size="md" colorScheme="green">
                    <TagLabel>{selected}</TagLabel>
                    <TagCloseButton onClick={() => {
                      const newArr = validValue.filter((v: string) => v !== selected);
                      onChange(fieldName, newArr);
                      onChange('section_id', []);
                    }} />
                  </Tag>
                )) : <Text color="gray.400" fontSize="sm">No selection</Text>}
              </HStack>
              <Menu>
                <MenuButton as={Button} size="sm" rightIcon={<FiChevronDown />} variant="outline" width="100%" isDisabled={pfArr.length === 0}>
                  {pfArr.length === 0 ? 'Select Portfolio(s) first' : 'Add option'}
                </MenuButton>
                <MenuList maxH="200px" overflowY="auto">
                  {projects.filter(opt => !validValue.includes(opt)).map(opt => (
                    <MenuItem key={opt} onClick={() => {
                      const newArr = [...validValue, opt];
                      onChange(fieldName, newArr);
                      onChange('section_id', []);
                    }}>{opt}</MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </Box>
          </FormControl>
        );
      }
      case 'section_id': {
        // Section options depend on selected project(s) (and portfolios)
        const pfArr = Array.isArray(editedTask?.portfolio_id) ? editedTask.portfolio_id.filter((p: string) => Object.keys(PORTFOLIO_PROJECT_SECTION).includes(p)) : [];
        const prArr = Array.isArray(editedTask?.project_id) ? editedTask.project_id : [];
        let sections: string[] = pfArr.flatMap((pf: string) => {
          const pm = PORTFOLIO_PROJECT_SECTION[pf];
          if (!pm) return [];
          return prArr.length ? prArr.flatMap((pr: string) => pm[pr] || []) : Object.values(pm).flat();
        });
        sections = Array.from(new Set(sections));
        const validValue = Array.isArray(value) ? value.filter(v => sections.includes(v)) : [];
        return (
          <FormControl key={fieldName} mb={4} isDisabled={!config.editable || pfArr.length === 0 || prArr.length === 0}>
            <FormLabel htmlFor={fieldName}>{config.label}</FormLabel>
            <Box minH="38px" borderWidth="1px" borderRadius="md" p={2} bg="white" _dark={{bg: 'gray.700'}}>
              <HStack wrap="wrap" spacing={2} mb={2} minH="32px">
                {validValue.length > 0 ? validValue.map((selected: string) => (
                  <Tag key={selected} size="md" colorScheme="purple">
                    <TagLabel>{selected}</TagLabel>
                    <TagCloseButton onClick={() => {
                      const newArr = validValue.filter((v: string) => v !== selected);
                      onChange(fieldName, newArr);
                    }} />
                  </Tag>
                )) : <Text color="gray.400" fontSize="sm">No selection</Text>}
              </HStack>
              <Menu>
                <MenuButton as={Button} size="sm" rightIcon={<FiChevronDown />} variant="outline" width="100%" isDisabled={pfArr.length === 0 || prArr.length === 0}>
                  {pfArr.length === 0 ? 'Select Portfolio(s) first' : prArr.length === 0 ? 'Select Project(s) first' : 'Add option'}
                </MenuButton>
                <MenuList maxH="200px" overflowY="auto">
                  {sections.filter(opt => !validValue.includes(opt)).map(opt => (
                    <MenuItem key={opt} onClick={() => {
                      const newArr = [...validValue, opt];
                      onChange(fieldName, newArr);
                    }}>{opt}</MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </Box>
          </FormControl>
        );
      }
      default:
        return null;
    }
  };

  const renderFieldValue = (fieldName: string, config: TaskFieldConfig, value: any) => {
    if (value === null || value === undefined || value === "") return <Text color="gray.400">N/A</Text>;
    try {
      switch (config.type) {
        case "multi-select":
          return Array.isArray(value) ? value.join(", ") : String(value);
        case "dropdown":
          if (config.options) {
            // Show label if option exists
            const opt = config.options.find(opt => opt === value);
            return <Text>{opt || value}</Text>;
          }
          return <Text>{value}</Text>;
        case "boolean":
          return <Text>{value ? "Yes" : "No"}</Text>;
        case "date":
          return <Text>{new Date(value).toLocaleString()}</Text>;
        case "number":
          return <Text>{String(value)}</Text>;
        case "textarea":
          return <Textarea value={value} isReadOnly size="sm" variant="unstyled" minH="40px" />;
        default:
          return <Text>{String(value)}</Text>;
      }
    } catch (err) {
      return <Text color="red.400">Error rendering value</Text>;
    }
  };

  const normalizeTask = (t: any) => {
    const result = { ...t };
    Object.entries(TASK_FIELD_CONFIG).forEach(([key, config]) => {
      const val = result[key];
      if (config.type === 'multi-select') {
        if (Array.isArray(val)) {
          result[key] = (val as any[])
            .map(v => String(v).trim())
            .filter(Boolean);
        } else if (val === null || val === undefined || val === '') {
          result[key] = [];
        } else {
          result[key] = String(val)
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);
        }
      } else {
        if (val === null || val === undefined) {
          result[key] = '';
        }
      }
    });
    return result;
  };

  const filteredProjects = useMemo(
    () => [],
    []
  );

  const filteredSections = useMemo(
    () => [],
    []
  );

  // Collect all detail fields dynamically, falling back to default config
  const allFieldEntries = useMemo(() => {
    if (!editedTask) return [];
    const hidden = ['name','due_date','deadline_type','priority','start_date','portfolio_id','project_id','section_id','tags','task_comments','notes','description'];
    return Object.keys(editedTask)
      .filter(key => isDisplayableField(key) && !hidden.includes(key))
      .map(key => {
        const config = TASK_FIELD_CONFIG[key] || { label: formatFieldName(key), type: 'text', editable: Boolean(onSaved) };
        return [key, config] as [string, typeof config];
      });
  }, [editedTask, TASK_FIELD_CONFIG, onSaved]);

  // --- FIELD DISPLAY CONFIG ---
  const PRIMARY_FIELDS = [
    "name",
    "due_date",
    "deadline_type",
    "start_date",
    "location",
    "task_type",
    "portfolio_id",
    "project_id",
    "section_id",
    "notes",
    "task_comments"
  ];

  const visibleFields = PRIMARY_FIELDS;
  const allFieldKeys = Object.keys(TASK_FIELD_CONFIG);
  const extraFields = allFieldKeys.filter(
    key => !visibleFields.includes(key)
  );

  if (loading) return (
    <Flex align="center" justify="center" minH="40vh" direction="column" gap={4}>
      <Spinner size="xl" color="brand.500" thickness="4px" speed="0.75s" />
      <Text color="gray.500">Loading task details...</Text>
    </Flex>
  );
  
  if (error) return (
    <Alert status="error" variant="left-accent" mt={6} borderRadius="md" alignItems="center" justifyContent="center" py={4}>
      <AlertIcon boxSize="24px" mr={3} />
      <Text fontSize="lg">{error}</Text>
    </Alert>
  );

  if (!task) return (
    <Alert status="error" variant="left-accent" mt={6} borderRadius="md" alignItems="center" justifyContent="center" py={4}>
      <AlertIcon boxSize="24px" mr={3} />
      <Text fontSize="lg">Task not found.</Text>
    </Alert>
  );

  const PRIORITY_OPTIONS = ["P0 - NOW", "P1 - Critical", "P2 - High", "P3 - Medium", "P4 - Low"];

  return (
    <Box 
      bg={cardBg} 
      borderRadius="xl" 
      boxShadow="lg"
      p={8} 
      w="100%" 
      maxW="100%"
      mx="auto"
      borderWidth="1px"
      borderColor={borderColor}
      transition="all 0.2s"
      _hover={{ boxShadow: "xl" }}
    >
      <Flex justify="space-between" align="center" mb={8}>
        <Button 
          leftIcon={<FiArrowLeft />} 
          colorScheme="blue" 
          variant="ghost" 
          onClick={onBack}
          fontWeight="medium"
          size="lg"
          borderRadius="md"
          px={6}
          py={6}
        >
          Back to List
        </Button>
        <Flex>
          <Button
            colorScheme="blue"
            onClick={onSave}
            isLoading={saving}
            leftIcon={<FiSave />}
            mr={4}
            size="lg"
            px={8}
          >
            Save Changes
          </Button>
        </Flex>
      </Flex>

      {/* Task ID and metadata badge row */}
      <Flex justify="flex-start" align="center" mb={6} flexWrap="wrap" gap={2}>
        <Badge 
          colorScheme="blue" 
          px={3} 
          py={2} 
          borderRadius="full" 
          fontSize="md"
        >
          ID: {task.id || "New"}
        </Badge>
        
        {task.created_at && (
          <Badge 
            colorScheme="gray" 
            px={3} 
            py={2} 
            borderRadius="full" 
            fontSize="md"
          >
            Created: {new Date(task.created_at).toLocaleDateString()}
          </Badge>
        )}
        
        {task.completed_at && (
          <Badge 
            colorScheme="green" 
            px={3} 
            py={2} 
            borderRadius="full" 
            fontSize="md"
          >
            Completed: {new Date(task.completed_at).toLocaleDateString()}
          </Badge>
        )}
        
        {task.last_modified_at && (
          <Badge 
            colorScheme="purple" 
            px={3} 
            py={2} 
            borderRadius="full" 
            fontSize="md"
          >
            Modified: {new Date(task.last_modified_at).toLocaleDateString()}
          </Badge>
        )}
      </Flex>

      {/* Success/Error Alerts */}
      {success && (
        <Alert status="success" mb={6} borderRadius="md" fontSize="lg" p={4}>
          <AlertIcon boxSize="24px" />
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert status="error" mb={6} borderRadius="md" fontSize="lg" p={4}>
          <AlertIcon boxSize="24px" />
          {error}
        </Alert>
      )}

      {/* Editable Fields Section (Dynamic) */}
      {editedTask && (
        <Box as="section" mb={10}>
          <Heading size="md" mb={4}>Edit Task Fields</Heading>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
            {visibleFields.map(field => {
              const config = TASK_FIELD_CONFIG[field];
              if (!config) return null;
              return (
                <GridItem key={field}>
                  {renderTaskField(field, editedTask[field], config, handleDynamicFieldChange, config.type === 'multi-select' ? { maxHeight: '160px', overflowY: 'auto' } : {})}
                </GridItem>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Multiselect UX: show selected with X for remove */}
      {visibleFields.filter(f => TASK_FIELD_CONFIG[f]?.type === 'multi-select').map(field => {
        const config = TASK_FIELD_CONFIG[field];
        const value = editedTask[field];
        const selected = Array.isArray(value) ? value : value ? value.split(',') : [];
        return (
          <HStack key={field} wrap="wrap" spacing={2}>
            {selected.map((val: string) => (
              <Tag key={val} size="md" borderRadius="full" variant="solid" colorScheme="blue">
                <TagLabel>{val}</TagLabel>
                <TagCloseButton onClick={() => {
                  const newVals = selected.filter((v: string) => v !== val);
                  handleDynamicFieldChange(field, newVals);
                }} />
              </Tag>
            ))}
          </HStack>
        );
      })}

      {/* Show All Details toggle */}
      <Button size="sm" variant="ghost" leftIcon={showAllFields ? <FiChevronUp /> : <FiChevronDown />} onClick={() => setShowAllFields(v => !v)} alignSelf="flex-start">
        {showAllFields ? 'Hide All Details' : 'Show All Details'}
      </Button>
      {showAllFields && (
        <Box mt={2} p={2} bg={fieldBg} borderRadius="md">
          {extraFields.map(field => {
            const config = TASK_FIELD_CONFIG[field];
            if (!config) return null;
            return (
              <FormControl key={field} mb={4} isDisabled={!config.editable}>
                {renderTaskField(field, editedTask[field], config, handleDynamicFieldChange, config.type === 'multi-select' ? { maxHeight: '160px', overflowY: 'auto' } : {})}
              </FormControl>
            );
          })}
        </Box>
      )}
      
      <Divider my={10} borderWidth="2px" />
      
      {/* Chat Section */}
      <Box role="region" aria-label="Task-Specific Chat" mb={8}>
        <Heading size="lg" mb={4}>Task-Specific Chat</Heading>
        <Box role="log" mb={4}>
          {chatHistory.length === 0 ? (
            <Text>No messages yet.</Text>
          ) : (
            chatHistory.map((m, i) => (
              <HStack key={i} align="start">
                <span style={{ fontWeight: 'bold' }}>{m.sender === "user" ? "You:" : "AI:"}</span>
                <span>{` ${m.message}`}</span>
              </HStack>
            ))
          )}
        </Box>
        <form onSubmit={handleChatSend}>
          <Input
            placeholder="Type your message..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            isDisabled={chatLoading}
          />
          <Button type="submit" colorScheme="blue" mt={2} isLoading={chatLoading}>
            Send
          </Button>
        </form>
      </Box>

      {/* Subtask CRUD Section */}
      <Box mb={8}>
        <Heading size="lg" mb={6} display="flex" alignItems="center">
          <FiList style={{ marginRight: '12px' }}/>
          Subtasks
        </Heading>
        
        {subtasksLoading ? (
          <Flex justify="center" py={6}>
            <Spinner size="xl" thickness="4px" />
          </Flex>
        ) : subtasksError ? (
          <Alert status="error" fontSize="lg" p={4}>
            <AlertIcon boxSize="24px" />
            {subtasksError}
          </Alert>
        ) : (
          <TaskDetailSubtasks
            subtasks={subtasks}
            onAdd={handleAddSubtask}
            onEdit={handleEditSubtask}
            onDelete={handleDeleteSubtask}
          />
        )}
      </Box>
    </Box>
  );
};

export default function TaskDetailWithBoundary(props: any) {
  return <TaskDetailErrorBoundary><TaskDetail {...props} /></TaskDetailErrorBoundary>;
}
