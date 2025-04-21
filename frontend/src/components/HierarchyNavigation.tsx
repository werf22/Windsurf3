import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Icon,
  VStack,
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Collapse,
  useColorModeValue,
  Skeleton,
  Button,
  Tooltip,
  Divider,
  Badge,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement
} from '@chakra-ui/react';
import {
  FiFolder,
  FiChevronRight,
  FiChevronDown,
  FiList,
  FiFilePlus,
  FiSearch,
  FiMenu,
  FiHome,
  FiPlus,
  FiFilter
} from 'react-icons/fi';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

// Types for hierarchy structure
interface HierarchyItem {
  id: number;
  name: string;
  type: 'portfolio' | 'project' | 'section' | 'task' | 'subtask';
  children?: HierarchyItem[];
  parent_id?: number; 
  count?: number;
  path?: string;
}

// Props for the component
interface HierarchyNavigationProps {
  auth: { username: string; password: string };
  onSelectItem?: (item: HierarchyItem) => void;
}

export const HierarchyNavigation: React.FC<HierarchyNavigationProps> = ({ auth, onSelectItem }) => {
  const [hierarchyData, setHierarchyData] = useState<HierarchyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [activePath, setActivePath] = useState<HierarchyItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Color tokens for UI
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const accentColor = useColorModeValue('brand.500', 'brand.300');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  
  // Fetch hierarchy data
  useEffect(() => {
    const fetchHierarchy = async () => {
      setLoading(true);
      try {
        // Ideally, there would be a single API endpoint to get the hierarchy structure
        // For now, we'll build it from multiple endpoints
        
        const portfoliosResponse = await axios.get('/api/portfolios', {
          headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) }
        });
        
        // Fetch projects for each portfolio
        const portfoliosWithProjects = await Promise.all(
          portfoliosResponse.data.map(async (portfolio: any) => {
            const projectsResponse = await axios.get(`/api/portfolios/${portfolio.id}/projects`, {
              headers: { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) }
            });
            
            return {
              id: portfolio.id,
              name: portfolio.name,
              type: 'portfolio' as const,
              children: projectsResponse.data.map((project: any) => ({
                id: project.id,
                name: project.name,
                type: 'project' as const,
                parent_id: portfolio.id,
                count: project.task_count || 0,
                path: `/portfolios/${portfolio.id}/projects/${project.id}`
              })),
              count: portfolio.task_count || 0,
              path: `/portfolios/${portfolio.id}`
            };
          })
        );
        
        setHierarchyData(portfoliosWithProjects);
      } catch (error) {
        console.error('Error fetching hierarchy data:', error);
        
        // Fallback to demo data if API is not available
        const demoData: HierarchyItem[] = [
          {
            id: 1,
            name: 'Work',
            type: 'portfolio',
            count: 12,
            path: '/portfolios/1',
            children: [
              {
                id: 101,
                name: 'Website Redesign',
                type: 'project',
                parent_id: 1,
                count: 5,
                path: '/portfolios/1/projects/101',
                children: [
                  {
                    id: 1001,
                    name: 'Design Phase',
                    type: 'section',
                    parent_id: 101,
                    count: 3,
                    path: '/portfolios/1/projects/101/sections/1001'
                  },
                  {
                    id: 1002,
                    name: 'Development',
                    type: 'section',
                    parent_id: 101,
                    count: 2,
                    path: '/portfolios/1/projects/101/sections/1002'
                  }
                ]
              },
              {
                id: 102,
                name: 'Content Marketing',
                type: 'project',
                parent_id: 1,
                count: 7,
                path: '/portfolios/1/projects/102'
              }
            ]
          },
          {
            id: 2,
            name: 'Personal',
            type: 'portfolio',
            count: 8,
            path: '/portfolios/2',
            children: [
              {
                id: 201,
                name: 'Health & Fitness',
                type: 'project',
                parent_id: 2,
                count: 4,
                path: '/portfolios/2/projects/201'
              },
              {
                id: 202,
                name: 'Learning',
                type: 'project',
                parent_id: 2,
                count: 4,
                path: '/portfolios/2/projects/202',
                children: [
                  {
                    id: 2001,
                    name: 'Programming',
                    type: 'section',
                    parent_id: 202,
                    count: 2,
                    path: '/portfolios/2/projects/202/sections/2001'
                  },
                  {
                    id: 2002,
                    name: 'Languages',
                    type: 'section',
                    parent_id: 202,
                    count: 2,
                    path: '/portfolios/2/projects/202/sections/2002'
                  }
                ]
              }
            ]
          }
        ];
        
        setHierarchyData(demoData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHierarchy();
  }, [auth]);
  
  // Handle expanding/collapsing items
  const toggleExpand = (id: number) => {
    setExpandedItems(prevState => {
      const newState = new Set(prevState);
      if (newState.has(id)) {
        newState.delete(id);
      } else {
        newState.add(id);
      }
      return newState;
    });
  };
  
  // Handle item selection
  const handleItemClick = (item: HierarchyItem, path: HierarchyItem[] = []) => {
    // Build the full path to this item
    const fullPath = [...path, item];
    setActivePath(fullPath);
    
    // If the item has children and isn't expanded, expand it
    if (item.children && item.children.length > 0 && !expandedItems.has(item.id)) {
      toggleExpand(item.id);
    }
    
    // Call the onSelectItem prop if provided
    if (onSelectItem) {
      onSelectItem(item);
    }
    
    // Navigate to the appropriate route
    if (item.path) {
      navigate(item.path);
    }
  };
  
  // Recursive function to find an item by ID in the hierarchy
  const findItemById = (
    id: number,
    items: HierarchyItem[] = hierarchyData,
    path: HierarchyItem[] = []
  ): { item: HierarchyItem | null; path: HierarchyItem[] } => {
    for (const item of items) {
      if (item.id === id) {
        return { item, path };
      }
      
      if (item.children && item.children.length > 0) {
        const result = findItemById(id, item.children, [...path, item]);
        if (result.item) {
          return result;
        }
      }
    }
    
    return { item: null, path: [] };
  };
  
  // Filter the hierarchy data based on search query
  const filterHierarchy = (
    items: HierarchyItem[],
    query: string
  ): HierarchyItem[] => {
    if (!query) return items;
    
    return items
      .map(item => {
        // Check if this item matches the query
        const nameMatch = item.name.toLowerCase().includes(query.toLowerCase());
        
        // Recursively filter children
        const filteredChildren = item.children
          ? filterHierarchy(item.children, query)
          : [];
        
        // Include this item if it matches or has matching children
        if (nameMatch || filteredChildren.length > 0) {
          return {
            ...item,
            children: filteredChildren
          };
        }
        
        return null;
      })
      .filter(Boolean) as HierarchyItem[];
  };
  
  // Get the filtered hierarchy data
  const filteredHierarchy = filterHierarchy(hierarchyData, searchQuery);
  
  // Render a single hierarchy item
  const renderHierarchyItem = (
    item: HierarchyItem,
    level: number = 0,
    path: HierarchyItem[] = []
  ) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = activePath.some(pathItem => pathItem.id === item.id);
    
    // Determine icon based on item type
    const getItemIcon = () => {
      switch (item.type) {
        case 'portfolio':
          return FiHome;
        case 'project':
          return FiFolder;
        case 'section':
          return FiList;
        case 'task':
        case 'subtask':
          return FiFilePlus;
        default:
          return FiFolder;
      }
    };
    
    return (
      <Box key={item.id}>
        <Flex
          py={2}
          px={level > 0 ? 4 + level * 4 : 4}
          alignItems="center"
          cursor="pointer"
          borderRadius="md"
          bg={isActive ? `${accentColor}10` : 'transparent'}
          color={isActive ? accentColor : textColor}
          fontWeight={isActive ? 'semibold' : 'normal'}
          _hover={{ bg: hoverBg }}
          onClick={() => handleItemClick(item, path)}
          role="group"
        >
          {hasChildren && (
            <Icon
              as={isExpanded ? FiChevronDown : FiChevronRight}
              mr={2}
              fontSize="sm"
              onClick={e => {
                e.stopPropagation();
                toggleExpand(item.id);
              }}
            />
          )}
          <Icon as={getItemIcon()} mr={2} color={isActive ? accentColor : mutedColor} />
          <Text flex="1" fontSize="sm" fontWeight={isActive ? 'semibold' : 'medium'}>
            {item.name}
          </Text>
          {item.count !== undefined && (
            <Badge
              colorScheme={isActive ? 'brand' : 'gray'}
              borderRadius="full"
              fontSize="xs"
              ml={2}
            >
              {item.count}
            </Badge>
          )}
        </Flex>
        
        {hasChildren && (
          <Collapse in={isExpanded} animateOpacity>
            <Box pl={2}>
              {item.children!.map(child =>
                renderHierarchyItem(child, level + 1, [...path, item])
              )}
            </Box>
          </Collapse>
        )}
      </Box>
    );
  };
  
  // Render the breadcrumb navigation
  const renderBreadcrumbs = () => {
    return (
      <Breadcrumb
        separator={<Icon as={FiChevronRight} color="gray.500" />}
        fontSize="sm"
        mb={4}
      >
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => navigate('/dashboard')} color={mutedColor}>
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {activePath.map((item, index) => (
          <BreadcrumbItem key={item.id} isCurrentPage={index === activePath.length - 1}>
            <BreadcrumbLink
              onClick={() => {
                const subPath = activePath.slice(0, index + 1);
                setActivePath(subPath);
                if (item.path) navigate(item.path);
              }}
              fontWeight={index === activePath.length - 1 ? 'semibold' : 'normal'}
              color={index === activePath.length - 1 ? accentColor : textColor}
            >
              {item.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        ))}
      </Breadcrumb>
    );
  };
  
  // Mobile drawer for hierarchy navigation
  const renderMobileDrawer = () => {
    return (
      <>
        <IconButton
          aria-label="Open navigation"
          icon={<FiMenu />}
          size="md"
          variant="ghost"
          display={{ base: 'flex', md: 'none' }}
          onClick={onOpen}
        />
        
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">Navigation</DrawerHeader>
            <DrawerBody p={0}>
              <InputGroup mx={3} my={4} size="sm">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  borderRadius="md"
                />
              </InputGroup>
              <VStack align="stretch" spacing={0} divider={<Divider />}>
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <Box p={4} key={i}>
                      <Skeleton height="20px" width="80%" />
                    </Box>
                  ))
                ) : filteredHierarchy.length === 0 ? (
                  <Box p={4} textAlign="center" color={mutedColor}>
                    No items found
                  </Box>
                ) : (
                  filteredHierarchy.map(item => renderHierarchyItem(item))
                )}
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    );
  };
  
  return (
    <Box>
      {/* Mobile View */}
      <Flex 
        display={{ base: 'flex', md: 'none' }} 
        alignItems="center" 
        justifyContent="space-between"
        mb={4}
      >
        {renderMobileDrawer()}
        {renderBreadcrumbs()}
      </Flex>
      
      {/* Desktop View */}
      <Flex display={{ base: 'none', md: 'flex' }} mb={4}>
        {renderBreadcrumbs()}
        <Tooltip label="Filter">
          <IconButton
            aria-label="Filter"
            icon={<FiFilter />}
            variant="ghost"
            colorScheme="brand"
            size="sm"
            ml="auto"
          />
        </Tooltip>
        <Tooltip label="Add new">
          <IconButton
            aria-label="Add new"
            icon={<FiPlus />}
            variant="ghost"
            colorScheme="brand"
            size="sm"
            ml={2}
          />
        </Tooltip>
      </Flex>
      
      <Flex>
        {/* Sidebar (desktop only) */}
        <Box
          display={{ base: 'none', md: 'block' }}
          w="280px"
          mr={6}
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          overflow="hidden"
          position="sticky"
          top="80px"
          alignSelf="flex-start"
          maxH="calc(100vh - 100px)"
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              width: '10px',
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: useColorModeValue('rgba(0,0,0,0.1)', 'rgba(255,255,255,0.1)'),
              borderRadius: '24px',
            },
          }}
        >
          <Flex p={4} borderBottomWidth="1px" borderColor={borderColor} align="center">
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                borderRadius="md"
              />
            </InputGroup>
          </Flex>
          
          <VStack align="stretch" spacing={0} divider={<Divider />}>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <Box p={4} key={i}>
                  <Skeleton height="20px" />
                </Box>
              ))
            ) : filteredHierarchy.length === 0 ? (
              <Box p={4} textAlign="center" color={mutedColor}>
                No items found
              </Box>
            ) : (
              filteredHierarchy.map(item => renderHierarchyItem(item))
            )}
          </VStack>
        </Box>
        
        {/* Main content area - will be rendered by the calling component */}
      </Flex>
    </Box>
  );
};

export default HierarchyNavigation;
