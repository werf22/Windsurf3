import React, { useState } from "react";
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  useColorModeValue, 
  Grid, 
  GridItem,
  Button,
  Card,
  CardHeader,
  CardBody,
  Badge,
  HStack,
  VStack,
  Icon,
  Divider,
  Tag,
  TagLabel,
  TagLeftIcon,
  SimpleGrid,
  Skeleton
} from "@chakra-ui/react";
import { FiFolder, FiLayers, FiCheckSquare, FiCalendar, FiClock, FiEdit } from "react-icons/fi";
import HierarchyNavigation from "../components/HierarchyNavigation";

interface HierarchyItemDetails {
  id: number;
  name: string;
  type: 'portfolio' | 'project' | 'section' | 'task' | 'subtask';
  description?: string;
  dueDate?: string;
  priority?: string;
  status?: string;
  taskCount?: number;
  createdAt?: string;
  completedAt?: string;
}

interface HierarchyProps {
  auth: { username: string; password: string };
}

const Hierarchy: React.FC<HierarchyProps> = ({ auth }) => {
  const [selectedItem, setSelectedItem] = useState<HierarchyItemDetails | null>(null);
  const [loading, setLoading] = useState(false);
  
  // UI color tokens
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.700", "gray.100");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const accentColor = useColorModeValue("brand.500", "brand.300");
  
  // Handle item selection
  const handleItemSelect = (item: any) => {
    setLoading(true);
    
    // Simulate API call to get details
    setTimeout(() => {
      // Convert the item from navigation to a details object
      const details: HierarchyItemDetails = {
        id: item.id,
        name: item.name,
        type: item.type,
        description: "This is a sample description for the selected item. In a real implementation, this would come from the API.",
        dueDate: item.type === 'task' || item.type === 'subtask' ? new Date().toISOString() : undefined,
        priority: item.type === 'task' || item.type === 'subtask' ? 'Medium' : undefined,
        status: item.type === 'task' || item.type === 'subtask' ? 'In Progress' : undefined,
        taskCount: item.count || 0,
        createdAt: new Date().toISOString(),
        completedAt: undefined
      };
      
      setSelectedItem(details);
      setLoading(false);
    }, 500);
  };
  
  // Format date for display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
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
  
  // Get badge color based on status
  const getStatusColor = (status?: string) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'green';
      case 'in progress': return 'blue';
      case 'not started': return 'gray';
      case 'blocked': return 'red';
      default: return 'gray';
    }
  };
  
  // Render the appropriate icon for the item type
  const getItemIcon = (type: string) => {
    switch(type) {
      case 'portfolio': return FiFolder;
      case 'project': return FiLayers;
      case 'section': return FiFolder;
      case 'task': 
      case 'subtask': return FiCheckSquare;
      default: return FiFolder;
    }
  };
  
  // Render the details panel
  const renderDetails = () => {
    if (loading) {
      return (
        <VStack spacing={4} align="stretch">
          <Skeleton height="40px" width="80%" />
          <Skeleton height="20px" width="60%" />
          <Skeleton height="100px" />
          <SimpleGrid columns={2} spacing={4}>
            <Skeleton height="30px" />
            <Skeleton height="30px" />
            <Skeleton height="30px" />
            <Skeleton height="30px" />
          </SimpleGrid>
        </VStack>
      );
    }
    
    if (!selectedItem) {
      return (
        <Flex 
          direction="column" 
          align="center" 
          justify="center" 
          p={8} 
          textAlign="center"
          color={subTextColor}
          h="100%"
        >
          <Icon as={FiFolder} boxSize={12} mb={4} opacity={0.5} />
          <Text fontSize="lg" fontWeight="medium">No item selected</Text>
          <Text mt={2}>Select an item from the hierarchy to view its details</Text>
        </Flex>
      );
    }
    
    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <HStack spacing={2} mb={2}>
            <Icon as={getItemIcon(selectedItem.type)} color={accentColor} boxSize={6} />
            <Heading size="md" color={textColor}>
              {selectedItem.name}
            </Heading>
          </HStack>
          
          <HStack spacing={2} wrap="wrap">
            <Tag size="sm" colorScheme="purple" borderRadius="full">
              <TagLeftIcon as={getItemIcon(selectedItem.type)} />
              <TagLabel textTransform="capitalize">{selectedItem.type}</TagLabel>
            </Tag>
            
            {selectedItem.type === 'task' || selectedItem.type === 'subtask' ? (
              <>
                {selectedItem.priority && (
                  <Badge colorScheme={getPriorityColor(selectedItem.priority)} px={2} py={1} borderRadius="full">
                    {selectedItem.priority}
                  </Badge>
                )}
                
                {selectedItem.status && (
                  <Badge colorScheme={getStatusColor(selectedItem.status)} px={2} py={1} borderRadius="full">
                    {selectedItem.status}
                  </Badge>
                )}
                
                {selectedItem.dueDate && (
                  <Tag size="sm" colorScheme="blue" borderRadius="full">
                    <TagLeftIcon as={FiCalendar} />
                    <TagLabel>{formatDate(selectedItem.dueDate)}</TagLabel>
                  </Tag>
                )}
              </>
            ) : (
              <Tag size="sm" colorScheme="cyan" borderRadius="full">
                <TagLeftIcon as={FiCheckSquare} />
                <TagLabel>{selectedItem.taskCount} tasks</TagLabel>
              </Tag>
            )}
          </HStack>
        </Box>
        
        <Divider />
        
        <Box>
          <Text fontWeight="medium" mb={2} color={textColor}>Description</Text>
          <Text color={subTextColor}>{selectedItem.description || 'No description available.'}</Text>
        </Box>
        
        <SimpleGrid columns={2} spacing={4}>
          <Box>
            <Text fontWeight="medium" fontSize="sm" color={subTextColor}>Created</Text>
            <HStack>
              <Icon as={FiClock} color={subTextColor} />
              <Text>{formatDate(selectedItem.createdAt)}</Text>
            </HStack>
          </Box>
          
          {selectedItem.type === 'task' || selectedItem.type === 'subtask' ? (
            <Box>
              <Text fontWeight="medium" fontSize="sm" color={subTextColor}>Due Date</Text>
              <HStack>
                <Icon as={FiCalendar} color={subTextColor} />
                <Text>{formatDate(selectedItem.dueDate)}</Text>
              </HStack>
            </Box>
          ) : null}
          
          {selectedItem.completedAt && (
            <Box>
              <Text fontWeight="medium" fontSize="sm" color={subTextColor}>Completed</Text>
              <HStack>
                <Icon as={FiCheckSquare} color="green.500" />
                <Text>{formatDate(selectedItem.completedAt)}</Text>
              </HStack>
            </Box>
          )}
        </SimpleGrid>
        
        <Flex mt={2}>
          <Button 
            leftIcon={<FiEdit />} 
            colorScheme="brand" 
            size="sm"
            variant="outline"
          >
            Edit {selectedItem.type}
          </Button>
          
          {selectedItem.type !== 'task' && selectedItem.type !== 'subtask' && (
            <Button 
              leftIcon={<FiCheckSquare />} 
              colorScheme="brand" 
              size="sm"
              variant="ghost"
              ml={2}
            >
              View Tasks
            </Button>
          )}
        </Flex>
      </VStack>
    );
  };

  return (
    <Box p={4}>
      <Heading 
        size="lg" 
        fontWeight="bold" 
        color={accentColor} 
        mb={6}
      >
        Task Hierarchy
      </Heading>
      
      <Grid 
        templateColumns={{ base: "1fr", md: "1fr 1fr" }} 
        gap={6}
      >
        <GridItem>
          <HierarchyNavigation 
            auth={auth} 
            onSelectItem={handleItemSelect} 
          />
        </GridItem>
        
        <GridItem>
          <Card 
            bg={cardBg} 
            borderRadius="lg" 
            borderWidth="1px" 
            borderColor={borderColor} 
            boxShadow="md"
            height="100%"
          >
            <CardHeader 
              borderBottomWidth="1px" 
              borderColor={borderColor}
              bg={useColorModeValue("gray.50", "gray.700")}
              py={4}
              px={6}
            >
              <Heading size="md" color={textColor}>Details</Heading>
            </CardHeader>
            <CardBody p={6}>
              {renderDetails()}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default Hierarchy;
