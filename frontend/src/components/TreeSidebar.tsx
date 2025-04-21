import React, { useState } from "react";
import { Box, VStack, Button, Heading, useColorModeValue, IconButton, Collapse, Text } from "@chakra-ui/react";
import { FiChevronDown, FiChevronRight, FiFolder, FiLayers, FiGrid } from "react-icons/fi";

export interface TreeNode {
  id: number;
  name: string;
  type: "portfolio" | "project" | "section" | "task" | "subtask";
  children?: TreeNode[];
}

interface TreeSidebarProps {
  tree: TreeNode[];
  onSelect: (node: TreeNode) => void;
  selectedId: number | null;
}

export const TreeSidebar: React.FC<TreeSidebarProps> = ({ tree, onSelect, selectedId }) => {
  const [expanded, setExpanded] = useState<{ [id: number]: boolean }>({});

  const sidebarBg = useColorModeValue("white", "gray.800");
  const sidebarShadow = useColorModeValue("md", "dark-lg");
  const iconMap = {
    portfolio: <FiFolder color="#3182ce" />, 
    project: <FiLayers color="#38a169" />, 
    section: <FiGrid color="#d69e2e" />, 
    task: <FiGrid color="#805ad5" />,
    subtask: <FiGrid color="#e53e3e" />
  };

  const toggle = (id: number) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const renderNode = (node: TreeNode, depth = 0) => (
    <Box key={node.id} ml={depth * 3}>
      <Box display="flex" alignItems="center" mb={1}>
        {node.children && (
          <IconButton
            aria-label={expanded[node.id] ? "Collapse" : "Expand"}
            icon={expanded[node.id] ? <FiChevronDown /> : <FiChevronRight />}
            size="xs"
            variant="ghost"
            onClick={() => toggle(node.id)}
            mr={1}
          />
        )}
        <Button
          leftIcon={iconMap[node.type]}
          size="sm"
          variant={selectedId === node.id ? "solid" : "ghost"}
          colorScheme={selectedId === node.id ? "blue" : undefined}
          fontWeight={node.type === "portfolio" ? 600 : node.type === "subtask" ? 400 : 400}
          borderRadius="md"
          onClick={() => onSelect(node)}
          w="100%"
          justifyContent="flex-start"
        >
          {node.name}
        </Button>
      </Box>
      {node.children && (
        <Collapse in={!!expanded[node.id]} animateOpacity>
          <VStack align="stretch" spacing={0} pl={4}>
            {node.children.map(child => renderNode(child, depth + 1))}
          </VStack>
        </Collapse>
      )}
    </Box>
  );

  return (
    <Box as="nav" aria-label="Portfolio-Project-Section Tree Sidebar" bg={sidebarBg} boxShadow={sidebarShadow} borderRadius="xl" p={6} minW="240px">
      <Heading size="md" mb={6} color="blue.700">Structure</Heading>
      {tree.length === 0 && <Text color="gray.400">No data</Text>}
      <VStack align="stretch" spacing={1}>
        {tree.map(node => renderNode(node))}
      </VStack>
    </Box>
  );
};
