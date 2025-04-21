import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Divider,
  Button,
  HStack,
  VStack,
  Icon,
  Badge,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Avatar,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  Skeleton,
  useToast
} from "@chakra-ui/react";
import axios from "axios";
import { FiTrendingUp, FiAlertCircle, FiCalendar, FiCheckCircle, FiClock, FiActivity, FiInbox, FiStar, FiPieChart, FiUser, FiFolder } from "react-icons/fi";

interface Task {
  id: number;
  name: string;
  due_date?: string;
  priority?: string;
  portfolio?: string;
  project?: string;
  sections?: string;
  ai_workflow_status?: string;
  created_at?: string;
  completed_at?: string;
  last_modified_at?: string;
}

interface DashboardStats {
  totalTasks: number;
  overdueTasks: number;
  dueToday: number;
  completedTasks: number;
  highPriority: number;
  portfolioDistribution: Record<string, number>;
  projectDistribution: Record<string, number>;
  recentActivity: Activity[];
}

interface Activity {
  id: number;
  type: 'created' | 'updated' | 'completed';
  taskId: number;
  taskName: string;
  timestamp: string;
}

interface HomeProps {
  auth?: { username: string; password: string };
}

export const Dashboard: React.FC<HomeProps> = ({ auth = { username: "", password: "" } }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    overdueTasks: 0,
    dueToday: 0,
    completedTasks: 0,
    highPriority: 0,
    portfolioDistribution: {},
    projectDistribution: {},
    recentActivity: []
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const toast = useToast();
  
  // Modern UI color tokens
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const accentColor = useColorModeValue("brand.500", "brand.300");
  const textColor = useColorModeValue("gray.700", "gray.100");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  // Section background color hoisted to maintain hook order
  const sectionBg = useColorModeValue("gray.50", "gray.700");
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all tasks to calculate stats
      const tasksResponse = await axios.get("/api/tasks", {
        headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) }
      });
      
      const tasks: Task[] = tasksResponse.data;
      
      // Calculate dashboard stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
      
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.completed_at).length;
      const overdueTasks = tasks.filter(t => t.due_date && t.due_date < today && !t.completed_at).length;
      const dueToday = tasks.filter(t => t.due_date === today && !t.completed_at).length;
      const highPriority = tasks.filter(t => t.priority?.toLowerCase() === 'high' && !t.completed_at).length;
      
      // Portfolio distribution
      const portfolioDistribution: Record<string, number> = {};
      tasks.forEach(task => {
        if (task.portfolio) {
          portfolioDistribution[task.portfolio] = (portfolioDistribution[task.portfolio] || 0) + 1;
        }
      });
      
      // Project distribution
      const projectDistribution: Record<string, number> = {};
      tasks.forEach(task => {
        if (task.project) {
          projectDistribution[task.project] = (projectDistribution[task.project] || 0) + 1;
        }
      });
      
      // Recent activity (mock data for now)
      const recentActivity: Activity[] = tasks.slice(0, 5).map((task, i) => ({
        id: i,
        type: i % 3 === 0 ? 'created' : i % 3 === 1 ? 'updated' : 'completed',
        taskId: task.id,
        taskName: task.name,
        timestamp: task.last_modified_at || task.created_at || new Date().toISOString()
      }));
      
      // Recent and upcoming tasks
      const recentTasks = [...tasks]
        .sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5);
        
      const upcomingTasks = [...tasks]
        .filter(t => t.due_date && !t.completed_at)
        .sort((a, b) => {
          const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
          const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
          return dateA - dateB;
        })
        .slice(0, 5);
      
      setStats({
        totalTasks,
        completedTasks,
        overdueTasks,
        dueToday,
        highPriority,
        portfolioDistribution,
        projectDistribution,
        recentActivity
      });
      
      setRecentTasks(recentTasks);
      setUpcomingTasks(upcomingTasks);
      
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Error loading dashboard");
      toast({
        title: "Error loading dashboard",
        description: "Could not fetch the latest data",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Helper to format dates
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch (e) {
      return dateStr;
    }
  };
  
  // Get badge color based on priority
  const getPriorityColor = (priority?: string) => {
    switch(priority?.toLowerCase()) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };
  
  return (
    <Box p={4}>
      {error && <Text color="red.500" mb={4}>{error}</Text>}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading 
          size="lg" 
          fontWeight="bold" 
          color={accentColor}
        >
          Dashboard
        </Heading>
        
        <Button
          colorScheme="brand"
          size="sm"
          onClick={fetchDashboardData}
          isLoading={loading}
          leftIcon={<Icon as={FiActivity} />}
        >
          Refresh
        </Button>
      </Flex>
      
      {/* Key Metrics */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4} mb={8}>
        <Skeleton isLoaded={!loading}>
          <Box 
            p={5} 
            bg={cardBg} 
            borderRadius="lg" 
            borderWidth="1px" 
            borderColor={borderColor} 
            boxShadow="md" 
            transition="all 0.2s"
            _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
          >
            <Flex align="center" mb={2}>
              <Icon as={FiInbox} boxSize={6} color="brand.500" mr={2} />
              <Text fontWeight="medium" fontSize="lg" color={textColor}>Total Tasks</Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="bold" color={textColor}>{stats.totalTasks}</Text>
            <Text fontSize="sm" color={subTextColor}>
              {stats.completedTasks} completed ({Math.round((stats.completedTasks / (stats.totalTasks || 1)) * 100)}%)
            </Text>
            <Progress 
              value={(stats.completedTasks / (stats.totalTasks || 1)) * 100} 
              colorScheme="brand" 
              size="sm" 
              mt={2} 
              borderRadius="full" 
            />
          </Box>
        </Skeleton>
        
        <Skeleton isLoaded={!loading}>
          <Box 
            p={5} 
            bg={cardBg} 
            borderRadius="lg" 
            borderWidth="1px" 
            borderColor={borderColor} 
            boxShadow="md" 
            transition="all 0.2s"
            _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
          >
            <Flex align="center" mb={2}>
              <Icon as={FiAlertCircle} boxSize={6} color="red.500" mr={2} />
              <Text fontWeight="medium" fontSize="lg" color={textColor}>Overdue</Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="bold" color="red.500">{stats.overdueTasks}</Text>
            <Text fontSize="sm" color={subTextColor}>
              Tasks past their due date
            </Text>
            <Progress 
              value={(stats.overdueTasks / (stats.totalTasks || 1)) * 100} 
              colorScheme="red" 
              size="sm" 
              mt={2} 
              borderRadius="full" 
            />
          </Box>
        </Skeleton>
        
        <Skeleton isLoaded={!loading}>
          <Box 
            p={5} 
            bg={cardBg} 
            borderRadius="lg" 
            borderWidth="1px" 
            borderColor={borderColor} 
            boxShadow="md" 
            transition="all 0.2s"
            _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
          >
            <Flex align="center" mb={2}>
              <Icon as={FiCalendar} boxSize={6} color="orange.500" mr={2} />
              <Text fontWeight="medium" fontSize="lg" color={textColor}>Due Today</Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="bold" color="orange.500">{stats.dueToday}</Text>
            <Text fontSize="sm" color={subTextColor}>
              Requires attention today
            </Text>
            <Progress 
              value={(stats.dueToday / (stats.totalTasks || 1)) * 100} 
              colorScheme="orange" 
              size="sm" 
              mt={2} 
              borderRadius="full" 
            />
          </Box>
        </Skeleton>
        
        <Skeleton isLoaded={!loading}>
          <Box 
            p={5} 
            bg={cardBg} 
            borderRadius="lg" 
            borderWidth="1px" 
            borderColor={borderColor} 
            boxShadow="md" 
            transition="all 0.2s"
            _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
          >
            <Flex align="center" mb={2}>
              <Icon as={FiStar} boxSize={6} color="yellow.500" mr={2} />
              <Text fontWeight="medium" fontSize="lg" color={textColor}>High Priority</Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="bold" color="yellow.500">{stats.highPriority}</Text>
            <Text fontSize="sm" color={subTextColor}>
              Tasks marked as high priority
            </Text>
            <Progress 
              value={(stats.highPriority / (stats.totalTasks || 1)) * 100} 
              colorScheme="yellow" 
              size="sm" 
              mt={2} 
              borderRadius="full" 
            />
          </Box>
        </Skeleton>
      </SimpleGrid>
      
      {/* Main Content Grid */}
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
        {/* Left Column */}
        <VStack align="stretch" spacing={6}>
          {/* Upcoming Tasks */}
          <Box 
            bg={cardBg} 
            borderRadius="lg" 
            borderWidth="1px" 
            borderColor={borderColor} 
            boxShadow="md" 
            overflow="hidden"
          >
            <Flex 
              bg={sectionBg} 
              px={6} 
              py={4} 
              justify="space-between" 
              align="center"
              borderBottomWidth="1px"
              borderBottomColor={borderColor}
            >
              <Heading size="md" color={textColor} fontWeight="semibold">Upcoming Tasks</Heading>
              <Icon as={FiCalendar} color={accentColor} />
            </Flex>
            
            <Box p={1}>
              <Table variant="simple" size="sm">
                <Thead bg={sectionBg}>
                  <Tr>
                    <Th>Task</Th>
                    <Th width="130px">Due Date</Th>
                    <Th width="100px">Priority</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <Tr key={`skeleton-upcoming-${i}`}>
                        <Td><Skeleton height="20px" /></Td>
                        <Td><Skeleton height="20px" /></Td>
                        <Td><Skeleton height="20px" /></Td>
                      </Tr>
                    ))
                  ) : upcomingTasks.length === 0 ? (
                    <Tr>
                      <Td colSpan={3} textAlign="center" py={4}>
                        <Text color={subTextColor}>No upcoming tasks</Text>
                      </Td>
                    </Tr>
                  ) : (
                    upcomingTasks.map((task) => (
                      <Tr 
                        key={task.id}
                        _hover={{ bg: sectionBg }}
                        cursor="pointer"
                        transition="background-color 0.2s"
                      >
                        <Td fontWeight="medium" maxW="300px" isTruncated>
                          <Tooltip label={task.name} hasArrow>
                            <Text>{task.name}</Text>
                          </Tooltip>
                        </Td>
                        <Td>
                          <Text fontSize="sm" fontWeight="medium" color={
                            !task.due_date ? subTextColor :
                            new Date(task.due_date) < new Date() ? "red.500" :
                            new Date(task.due_date).toDateString() === new Date().toDateString() ? "orange.500" :
                            textColor
                          }>
                            {formatDate(task.due_date)}
                          </Text>
                        </Td>
                        <Td>
                          <Badge 
                            colorScheme={getPriorityColor(task.priority)} 
                            px={2} 
                            py={1} 
                            borderRadius="full"
                          >
                            {task.priority || "None"}
                          </Badge>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>
          </Box>
          
          {/* Recent Activity */}
          <Box 
            bg={cardBg} 
            borderRadius="lg" 
            borderWidth="1px" 
            borderColor={borderColor} 
            boxShadow="md" 
            overflow="hidden"
          >
            <Flex 
              bg={sectionBg} 
              px={6} 
              py={4} 
              justify="space-between" 
              align="center"
              borderBottomWidth="1px"
              borderBottomColor={borderColor}
            >
              <Heading size="md" color={textColor} fontWeight="semibold">Recent Activity</Heading>
              <Icon as={FiActivity} color={accentColor} />
            </Flex>
            
            <VStack align="stretch" spacing={0} divider={<Divider />}>
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <Box key={`skeleton-activity-${i}`} p={4}>
                    <Skeleton height="20px" width="70%" mb={2} />
                    <Skeleton height="16px" width="40%" />
                  </Box>
                ))
              ) : stats.recentActivity.length === 0 ? (
                <Box p={6} textAlign="center">
                  <Text color={subTextColor}>No recent activity</Text>
                </Box>
              ) : (
                stats.recentActivity.map((activity) => (
                  <Flex key={activity.id} p={4} align="flex-start">
                    <Box 
                      p={2} 
                      borderRadius="full" 
                      bg={
                        activity.type === 'created' ? 'green.100' :
                        activity.type === 'updated' ? 'blue.100' :
                        'purple.100'
                      }
                      color={
                        activity.type === 'created' ? 'green.700' :
                        activity.type === 'updated' ? 'blue.700' :
                        'purple.700'
                      }
                      mr={4}
                    >
                      <Icon 
                        as={
                          activity.type === 'created' ? FiCheckCircle :
                          activity.type === 'updated' ? FiClock :
                          FiCheckCircle
                        } 
                        boxSize={5}
                      />
                    </Box>
                    <Box>
                      <Text fontWeight="medium" color={textColor}>
                        Task {activity.type}: {activity.taskName}
                      </Text>
                      <Text fontSize="sm" color={subTextColor}>
                        {new Date(activity.timestamp).toLocaleString()}
                      </Text>
                    </Box>
                  </Flex>
                ))
              )}
            </VStack>
          </Box>
        </VStack>
        
        {/* Right Column */}
        <VStack align="stretch" spacing={6}>
          {/* Completion Status */}
          <Box 
            bg={cardBg} 
            borderRadius="lg" 
            borderWidth="1px" 
            borderColor={borderColor} 
            boxShadow="md" 
            p={6}
          >
            <Heading size="md" mb={4} color={textColor} fontWeight="semibold">Completion Status</Heading>
            <Flex justify="center" p={4}>
              <Skeleton isLoaded={!loading} borderRadius="full">
                <CircularProgress 
                  value={(stats.completedTasks / (stats.totalTasks || 1)) * 100} 
                  size="200px"
                  thickness="12px"
                  color="brand.500"
                >
                  <CircularProgressLabel fontSize="2xl" fontWeight="bold">
                    {Math.round((stats.completedTasks / (stats.totalTasks || 1)) * 100)}%
                  </CircularProgressLabel>
                </CircularProgress>
              </Skeleton>
            </Flex>
            <Flex justify="space-between" mt={4}>
              <VStack align="flex-start">
                <Text fontSize="sm" color={subTextColor}>Completed</Text>
                <Text fontWeight="bold" color={textColor}>{stats.completedTasks}</Text>
              </VStack>
              <VStack align="flex-end">
                <Text fontSize="sm" color={subTextColor}>Remaining</Text>
                <Text fontWeight="bold" color={textColor}>
                  {stats.totalTasks - stats.completedTasks}
                </Text>
              </VStack>
            </Flex>
          </Box>
          
          {/* Portfolios Overview */}
          <Box 
            bg={cardBg} 
            borderRadius="lg" 
            borderWidth="1px" 
            borderColor={borderColor} 
            boxShadow="md" 
            overflow="hidden"
          >
            <Flex 
              bg={sectionBg} 
              px={6} 
              py={4} 
              justify="space-between" 
              align="center"
              borderBottomWidth="1px"
              borderBottomColor={borderColor}
            >
              <Heading size="md" color={textColor} fontWeight="semibold">Portfolios</Heading>
              <Icon as={FiFolder} color={accentColor} />
            </Flex>
            
            <Box p={4}>
              {loading ? (
                <VStack align="stretch" spacing={3}>
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} height="30px" />
                  ))}
                </VStack>
              ) : Object.keys(stats.portfolioDistribution).length === 0 ? (
                <Text color={subTextColor} textAlign="center" py={2}>No portfolio data available</Text>
              ) : (
                <VStack align="stretch" spacing={3}>
                  {Object.entries(stats.portfolioDistribution)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([portfolio, count], index) => (
                      <Box key={portfolio}>
                        <Flex justify="space-between" mb={1}>
                          <Text fontSize="sm" fontWeight="medium" color={textColor}>{portfolio}</Text>
                          <Text fontSize="sm" color={textColor}>{count} tasks</Text>
                        </Flex>
                        <Progress 
                          value={(count / stats.totalTasks) * 100} 
                          colorScheme={
                            index % 5 === 0 ? "brand" : 
                            index % 5 === 1 ? "purple" : 
                            index % 5 === 2 ? "cyan" : 
                            index % 5 === 3 ? "orange" : 
                            "green"
                          } 
                          size="sm" 
                          borderRadius="full" 
                        />
                      </Box>
                    ))
                  }
                </VStack>
              )}
            </Box>
          </Box>
          
          {/* Recently Added Tasks */}
          <Box 
            bg={cardBg} 
            borderRadius="lg" 
            borderWidth="1px" 
            borderColor={borderColor} 
            boxShadow="md" 
            overflow="hidden"
          >
            <Flex 
              bg={sectionBg} 
              px={6} 
              py={4} 
              justify="space-between" 
              align="center"
              borderBottomWidth="1px"
              borderBottomColor={borderColor}
            >
              <Heading size="md" color={textColor} fontWeight="semibold">Recently Added</Heading>
              <Icon as={FiClock} color={accentColor} />
            </Flex>
            
            <VStack align="stretch" spacing={0} divider={<Divider />}>
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <Box key={`skeleton-recent-${i}`} p={4}>
                    <Skeleton height="20px" mb={2} />
                    <Skeleton height="16px" width="60%" />
                  </Box>
                ))
              ) : recentTasks.length === 0 ? (
                <Box p={6} textAlign="center">
                  <Text color={subTextColor}>No tasks added recently</Text>
                </Box>
              ) : (
                recentTasks.map(task => (
                  <Box key={task.id} p={4} _hover={{ bg: sectionBg }} cursor="pointer">
                    <Text fontWeight="medium" color={textColor} noOfLines={1}>{task.name}</Text>
                    <Text fontSize="sm" color={subTextColor} mt={1}>
                      Added {formatDate(task.created_at)}
                    </Text>
                  </Box>
                ))
              )}
            </VStack>
          </Box>
        </VStack>
      </Grid>
    </Box>
  );
};

export default Dashboard;
