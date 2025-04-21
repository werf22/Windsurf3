import React, { useContext } from "react";
import { Box, Heading, useColorModeValue } from "@chakra-ui/react";
import { AIChat } from "../components/AIChat";

// If you have an authentication context/provider, use it here
// For now, use a demo auth (replace with real user context)
const demoAuth = { username: "demo", password: "demo" };

const Chat: React.FC = () => {
  // Replace demoAuth with real auth context as needed
  const cardBg = useColorModeValue("white", "gray.800");
  const cardShadow = useColorModeValue("md", "dark-lg");
  return (
    <Box maxW="2xl" mx="auto" bg={cardBg} boxShadow={cardShadow} borderRadius="xl" p={8} mt={8}>
      <Heading size="lg" mb={4} color="blue.700">Global AI Chat</Heading>
      <AIChat auth={demoAuth} />
    </Box>
  );
};

export default Chat;
