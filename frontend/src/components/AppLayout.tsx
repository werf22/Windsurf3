import { Flex, Box, Stack, Button, IconButton as ChakraIconButton, Heading, Spacer } from "@chakra-ui/react";
import { FiMenu, FiHome, FiList, FiLayers, FiMessageCircle, FiUser, FiSettings, FiHelpCircle, FiMoon, FiSun } from "react-icons/fi";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useColorMode } from "@chakra-ui/react";
import { ProfileMenu } from "./ProfileMenu";

interface LayoutProps {
  children: ReactNode;
  onSidebarToggle?: () => void;
  auth?: { username: string; password: string } | null;
}

const navLinks = [
  { label: "Dashboard", icon: FiHome, path: "/dashboard" },
  { label: "Tasks", icon: FiList, path: "/tasks" },
  { label: "Hierarchy", icon: FiLayers, path: "/hierarchy" },
  { label: "Global Chat", icon: FiMessageCircle, path: "/global-chat" },
  { label: "Profile", icon: FiUser, path: "/profile" },
  { label: "Settings", icon: FiSettings, path: "/settings" },
  { label: "Help", icon: FiHelpCircle, path: "/help" },
];

export function Layout({ children, onSidebarToggle, auth }: LayoutProps) {
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Flex minH="100vh" bg="gray.50">
      <Box as="aside" w={{ base: 16, md: 56 }} bg="white" boxShadow="md" py={6} px={2} display={{ base: "none", md: "block" }}>
        <Stack gap={4} align="stretch">
          {navLinks.map(link => (
            <Button
              key={link.label}
              variant="ghost"
              justifyContent="flex-start"
              onClick={() => navigate(link.path)}
              fontWeight="normal"
              fontSize="md"
              display="flex"
              alignItems="center"
              gap={3}
            >
              <link.icon style={{ marginRight: 8 }} />
              {link.label}
            </Button>
          ))}
        </Stack>
      </Box>
      <Flex direction="column" flex="1">
        <Flex as="nav" align="center" bg="white" px={6} py={3} boxShadow="sm">
          {onSidebarToggle && (
            <ChakraIconButton
              aria-label="Open menu"
              children={<FiMenu />}
              variant="ghost"
              mr={2}
              onClick={onSidebarToggle}
            />
          )}
          <Heading size="md" color="blue.700">Cerulík AI Task Manager</Heading>
          <Spacer />
          <ChakraIconButton
            aria-label="Toggle color mode"
            onClick={toggleColorMode}
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            variant="ghost"
            mr={4}
          />
          <ProfileMenu
            username={auth?.username || "demo"}
            fullName={undefined}
            email={auth?.email || (auth?.username ? undefined : "demo@example.com")}
            onLogout={() => { localStorage.removeItem('auth'); window.location.reload(); }}
            onDeleteAccount={() => { alert('Account deleted (demo)'); }}
          />
        </Flex>
        <Box flex="1" p={6}>{children}</Box>
      </Flex>
    </Flex>
  );
}
