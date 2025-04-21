import React, { useEffect, useState } from "react";
import axios from "axios";
import { TaskRow } from "./TaskRow";
import { TaskFilter } from "./TaskFilter";
import { TaskDetail } from "./TaskDetail";
import { 
  Box, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Button, 
  Heading, 
  useColorModeValue, 
  Text, 
  Flex,
  Icon,
  Tooltip,
  Badge,
  Spinner,
  HStack,
  VStack
} from "@chakra-ui/react";
import { FiChevronUp, FiChevronDown, FiEye, FiInfo } from "react-icons/fi";

// --- DYNAMIC FIELD CONFIGURATION ---
// CSV fields from TASK_TABLE_FIELDS_EXAMPLE_STRUCTURE.csv
const CSV_FIELDS = [
  "Task ID","Name","Description","Notes","Task Comments","Portfolio","Project","Sections","Parent Task","Parent Task ID","Subtasks (for user)","Subtasks (for AI)","Subtasks (in System)","Subtasks ID (in System)","AI Brainstorm Ideas on How It Can Help Me:","Dependents","Dependents ID","Outgoing Dependents","Outgoing Dependents ID","Tags","Priority","Due Date","Start Date","Deadline Type","Recurrence / Frequency","Created At","Completed At","Last Modified At","Task Goal","Input Data & Context","Desired Output Format","AI Action / Process (Free Text)","AI Action / Process (Dropdown)","AI Workflow Status","Allow Autonomous Execution","Number of Variations (If Applicable)","Desired Style / Tone","Specific Constraints / Instructions","AI Behavior on Uncertainty","AI Creativity Level","AI Processing Priority","AI Agent Status Log","AI Output / Result Link","Action Required From User","Related Portfolios","Related Projects","Related Sections","Related Tasks","Related Tasks ID","Related Entities","Target Audience","Task Purpose (Why)","Type","Task Type","Estimated User Time","Cognitive Load (For User)","Energy Level Required (For User)","Required Tools / Software","Required Hardware","Required Skills","Estimated Cost / Budget","Expected Impact / Success Metric","Location","Execution Location","Required Device(s)","Internet Requirement","Focus Requirement","Optimal Time of Day","Assignee","Collaborators","Related Entity","Waiting For","Financial Return (Value & Speed)","AI Output Rating","Feedback for AI","Suggested Initial Steps / Subtasks","Relatated Areas for AI to Consider","Potential Dependencies / Related Tasks"
];

// Default to showing only a few important fields for readability
const DEFAULT_VISIBLE_FIELDS = [
  "Name", 
  "Portfolio", 
  "Project", 
  "Sections", 
  "Priority", 
  "Due Date", 
  "Tags",
  "AI Workflow Status"
];

export interface Task {
  id: number;
  name: string;
  description?: string;
  portfolio?: string;
  portfolio_id?: number;
  project?: string;
  project_id?: number;
  sections?: string;
  section_id?: number;
  priority?: string;
  priority_id?: number;
  due_date?: string;
  tags?: string;
  assignee?: string;
  ai_workflow_status?: string;
  created_at?: string;
  completed_at?: string;
  last_modified_at?: string;
}

export interface TaskFilters {
  [key: string]: string;
}

interface HomeProps {
  auth: { username: string; password: string };
  TaskFilterProps?: Record<string, any>;
}

export const TaskTable: React.FC<HomeProps> = ({ auth, TaskFilterProps = {} }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>(TaskFilterProps);
  const [sortKey, setSortKey] = useState<string>('due_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [refreshList, setRefreshList] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Convert CSV field names to API field names (lowercase, no spaces)
  const normalizeFieldName = (name: string) => {
    return name.toLowerCase().replace(/[ /():]/g, '_').replace(/[^a-z0-9_]/g, '');
  };

  // Create a unique keyset for table headers to avoid React key warnings
  const UNIQUE_FIELD_KEYS = DEFAULT_VISIBLE_FIELDS.map(normalizeFieldName);

  const cardBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const accentColor = useColorModeValue("brand.500", "brand.300");

  useEffect(() => {
    if (refreshList) {
      loadTasks();
      setRefreshList(false);
    }
  }, [refreshList, sortKey, sortDir, filters]);

  useEffect(() => {
    // Update filters when TaskFilterProps change
    setFilters(prevFilters => ({...prevFilters, ...TaskFilterProps}));
  }, [TaskFilterProps]);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = "/api/tasks";
      const params: any = { ...filters };
      if (sortKey) {
        params.sort_by = normalizeFieldName(sortKey);
        params.sort_dir = sortDir;
      }
      
      const resp = await axios.get(url, {
        params,
        headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) }
      });
      
      setTasks(resp.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks. Please try again later.");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: TaskFilters) => {
    setFilters(newFilters);
    setRefreshList(true);
  };

  const handleSort = (field: string) => {
    if (field === sortKey) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(field);
      setSortDir('asc');
    }
    setRefreshList(true);
  };

  // Format a field value for display
  const formatValue = (field: string, value: any): React.ReactNode => {
    if (value === undefined || value === null || value === '') return '';
    
    // Format based on field type
    switch(field.toLowerCase()) {
      case 'priority':
        return <PriorityBadge priority={value} />;
      case 'ai_workflow_status':
        return <StatusBadge status={value} />;
      case 'due_date':
      case 'start_date':
      case 'created_at':
      case 'completed_at':
      case 'last_modified_at':
        return formatDate(value);
      default:
        return String(value);
    }
  };

  // Format date for readability
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch (e) {
      return dateStr;
    }
  };

  const refreshTasks = () => {
    setRefreshList(true);
  };

  return (
    <Box p={4} borderRadius="xl" boxShadow="md" bg={cardBg} w="100%">
      {selectedTaskId ? (
        <TaskDetail 
          taskId={selectedTaskId} 
          auth={auth} 
          onBack={() => setSelectedTaskId(null)}
          onSaved={() => setRefreshList(true)}
        />
      ) : (
        <VStack spacing={4} align="stretch">
          <Flex align="center" justify="space-between">
            <Heading size="md" fontWeight="semibold" color={accentColor}>Tasks</Heading>
            {loading && <Spinner size="sm" colorScheme="brand" />}
          </Flex>
          
          <TaskFilter filters={filters} onFiltersChange={handleFiltersChange} debounceMs={300} {...TaskFilterProps} />
          
          {error && (
            <Box p={3} bg="error.50" color="error.600" borderRadius="md" borderLeft="4px" borderLeftColor="error.500">
              <HStack>
                <Icon as={FiInfo} />
                <Text>{error}</Text>
              </HStack>
            </Box>
          )}
          
          <Box 
            overflowX="auto" 
            borderRadius="lg" 
            borderWidth="1px" 
            borderColor={borderColor} 
            boxShadow="sm"
            transition="all 0.2s"
            _hover={{ boxShadow: "md" }}
          >
            <Table variant="simple" size="md">
              <Thead bg={headerBg}>
                <Tr>
                  {DEFAULT_VISIBLE_FIELDS.map((field) => {
                    const normalizedField = normalizeFieldName(field);
                    return (
                      <Th
                        key={normalizedField}
                        position="sticky"
                        top={0}
                        px={4}
                        py={3}
                        fontSize="xs"
                        fontWeight="medium"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        color={sortKey === normalizedField ? accentColor : "gray.600"}
                        _dark={{ color: sortKey === normalizedField ? accentColor : "gray.400" }}
                        cursor="pointer"
                        transition="all 0.2s"
                        userSelect="none"
                        _hover={{ color: accentColor }}
                        onClick={() => handleSort(normalizedField)}
                      >
                        <HStack spacing={1}>
                          <Text>{field}</Text>
                          {sortKey === normalizedField && (
                            <Icon 
                              as={sortDir === 'asc' ? FiChevronUp : FiChevronDown} 
                              aria-label={sortDir === 'asc' ? "Sorted ascending" : "Sorted descending"} 
                            />
                          )}
                        </HStack>
                      </Th>
                    );
                  })}
                  <Th width="120px" textAlign="center">Actions</Th>
                  <Th width="120px" textAlign="center">Task Row</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading && tasks.length === 0 ? (
                  <Tr>
                    <Td colSpan={DEFAULT_VISIBLE_FIELDS.length + 2} textAlign="center" py={8}>
                      <Spinner size="md" color="brand.500" />
                    </Td>
                  </Tr>
                ) : tasks.length === 0 ? (
                  <Tr>
                    <Td colSpan={DEFAULT_VISIBLE_FIELDS.length + 2} textAlign="center" py={8}>
                      <Text color="gray.500">No tasks found. Try adjusting your filters.</Text>
                    </Td>
                  </Tr>
                ) : (
                  tasks.map((task) => (
                    <Tr 
                      key={task.id} 
                      _hover={{ bg: hoverBg }} 
                      transition="background-color 0.2s"
                      cursor="pointer"
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      {/* Render each field cell */}
                      {DEFAULT_VISIBLE_FIELDS.map(field => {
                        const normalizedField = normalizeFieldName(field);
                        return (
                          <Td key={`${task.id}-${normalizedField}`} px={4} py={3}>
                            {formatValue(normalizedField, task[normalizedField as keyof Task])}
                          </Td>
                        );
                      })}
                      {/* Actions cell */}
                      <Td textAlign="center">
                        <Tooltip label="View details" hasArrow>
                          <Button 
                            size="sm" 
                            colorScheme="brand" 
                            variant="ghost" 
                            leftIcon={<Icon as={FiEye} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTaskId(task.id);
                            }}
                          >
                            View
                          </Button>
                        </Tooltip>
                      </Td>
                      {/* TaskRow cell: now renders <td>s directly */}
                      <TaskRow task={task} onUpdate={refreshTasks} auth={auth} />
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </VStack>
      )}
    </Box>
  );
};

// Component for displaying priority with color coding
const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  let color = "gray";
  
  switch (priority?.toLowerCase()) {
    case 'high':
    case 'urgent':
      color = "red";
      break;
    case 'medium':
      color = "orange";
      break;
    case 'low':
      color = "green";
      break;
    default:
      color = "gray";
  }
  
  return (
    <Badge colorScheme={color} px={2} py={1} borderRadius="full" fontSize="xs" fontWeight="medium">
      {priority || "None"}
    </Badge>
  );
};

// Component for displaying workflow status with color coding
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let color = "gray";
  
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'done':
      color = "green";
      break;
    case 'in progress':
    case 'processing':
      color = "blue";
      break;
    case 'failed':
    case 'error':
      color = "red";
      break;
    case 'waiting':
    case 'pending':
      color = "orange";
      break;
    default:
      color = "gray";
  }
  
  return (
    <Badge colorScheme={color} px={2} py={1} borderRadius="full" fontSize="xs" fontWeight="medium">
      {status || "Not started"}
    </Badge>
  );
};
