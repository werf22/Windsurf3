import React from "react";
import { Box, VStack, Button, Heading, useColorModeValue } from "@chakra-ui/react";
import { FiChevronRight } from "react-icons/fi";

interface SidebarProps {
  items: { id: number; name: string; onClick: () => void }[];
  title?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, title }) => {
  const sidebarBg = useColorModeValue("white", "gray.800");
  const sidebarShadow = useColorModeValue("md", "dark-lg");
  return (
    <Box as="nav" aria-label="Sidebar Navigation" bg={sidebarBg} boxShadow={sidebarShadow} borderRadius="xl" p={6} minW="220px">
      {title && <Heading size="md" mb={6} color="blue.700">{title}</Heading>}
      <VStack align="stretch" spacing={2}>
        {items.map(item => (
          <Button
            key={item.id}
            onClick={item.onClick}
            justifyContent="flex-start"
            leftIcon={<FiChevronRight />}
            variant="ghost"
            colorScheme="blue"
            fontWeight="normal"
            borderRadius="md"
            size="md"
            _hover={{ bg: useColorModeValue('blue.50', 'gray.700') }}
          >
            {item.name}
          </Button>
        ))}
      </VStack>
    </Box>
  );
};
