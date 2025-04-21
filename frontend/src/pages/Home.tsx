import React, { useState, useEffect } from "react";
import { 
  Box, 
  Button, 
  Flex, 
  Heading, 
  useColorModeValue, 
  Icon, 
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  VStack,
  Text,
  Alert,
  AlertIcon,
  Tooltip,
  IconButton,
  Divider
} from "@chakra-ui/react";
import { FiPlus, FiUploadCloud, FiDownloadCloud, FiFilter, FiRefreshCw } from "react-icons/fi";
import { TaskTable } from "../components/TaskTable";
import { CSVControls } from "../components/CSVControls";
import { TaskCreate } from "../components/TaskCreate";
import { AIChat } from "../components/AIChat";
import axios from "axios";

interface HomeProps {
  auth: { username: string; password: string };
}

const Home: React.FC<HomeProps> = ({ auth }) => {
  const { isOpen, onOpen, onClose } = useDisclosure(); // For new task modal
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [refreshTable, setRefreshTable] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modern UI theme colors
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.700", "gray.100");
  const accentColor = useColorModeValue("brand.500", "brand.300");
  
  // Helper to get axios config with auth header
  const axiosAuthConfig = () => ({
    headers: {
      Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`)
    },
    withCredentials: true
  });

  // Set up axios defaults for Basic Auth
  useEffect(() => {
    axios.defaults.headers.common['Authorization'] = 'Basic ' + btoa(`${auth.username}:${auth.password}`);
    axios.defaults.withCredentials = true;
  }, [auth]);
  
  // Handle task creation success
  const handleTaskCreated = () => {
    onClose(); // Close the modal
    setRefreshTable(true); // Refresh the task list
  };
  
  // Reset any API errors
  const resetError = () => {
    setError(null);
  };
  
  // Import CSV handler
  const handleImportCSV = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post('/api/tasks/import/csv', formData, {
        headers: {
          ...axiosAuthConfig().headers,
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      setRefreshTable(true);
    } catch (err) {
      console.error("Error importing CSV:", err);
      setError("Failed to import CSV. Please check the file format and try again.");
    }
  };
  
  // Export CSV handler
  const handleExportCSV = async () => {
    try {
      const response = await axios.get('/api/tasks/export/csv', {
        responseType: 'blob',
        ...axiosAuthConfig()
      });
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tasks_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error exporting CSV:", err);
      setError("Failed to export CSV. Please try again later.");
    }
  };

  return (
    <Box p={4}>
      <Flex mb={6} justifyContent="space-between" alignItems="center" flexWrap="wrap">
        <Heading 
          size="lg" 
          fontWeight="bold" 
          color={accentColor}
        >
          AI To Do List
        </Heading>
        
        <HStack spacing={3}>
          <Tooltip hasArrow label="Export to CSV">
            <IconButton
              aria-label="Export to CSV"
              icon={<Icon as={FiDownloadCloud} />}
              size="md"
              colorScheme="brand"
              variant="outline"
              onClick={handleExportCSV}
            />
          </Tooltip>
          
          <Tooltip hasArrow label="Import from CSV">
            <IconButton
              aria-label="Import from CSV"
              icon={<Icon as={FiUploadCloud} />}
              size="md"
              colorScheme="brand"
              variant="outline"
              onClick={() => {
                // Create a file input and trigger it
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.csv';
                input.onchange = (e: any) => {
                  if (e.target.files.length) {
                    handleImportCSV(e.target.files[0]);
                  }
                };
                input.click();
              }}
            />
          </Tooltip>
          
          <Tooltip hasArrow label="Refresh">
            <IconButton
              aria-label="Refresh tasks"
              icon={<Icon as={FiRefreshCw} />}
              size="md"
              colorScheme="brand"
              variant="outline"
              onClick={() => setRefreshTable(true)}
            />
          </Tooltip>
          
          <Button
            leftIcon={<Icon as={FiPlus} />}
            colorScheme="brand"
            size="md"
            onClick={onOpen}
            ml={{ base: 0, md: 4 }}
          >
            New Task
          </Button>
        </HStack>
      </Flex>
      {/* CSV Import/Export Buttons */}
      <CSVControls auth={auth} onImportComplete={() => setRefreshTable(true)} />
      
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      {/* Task Table */}
      <Box>
        <TaskTable 
          auth={auth} 
          TaskFilterProps={filters}
        />
      </Box>
      
      {/* AI Chat Section */}
      <Box role="region" aria-label="AI Chat" mt={6}>
        <AIChat auth={auth} />
      </Box>
      
      {/* New Task Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent borderRadius="lg">
          <ModalHeader 
            borderBottomWidth="1px" 
            borderColor={borderColor}
            color={accentColor}
          >
            Create New Task
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={6}>
            <TaskCreate 
              auth={auth} 
              onCreated={handleTaskCreated} 
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Home;
