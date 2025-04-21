import React from "react";
import { Box, Heading, useColorModeValue } from "@chakra-ui/react";
import { AIChat } from "../components/AIChat";

const GlobalChat: React.FC = () => {
  // Use correct credentials for E2E and app auth
  const auth = { username: "jakub", password: "cerulik123" };
  const cardBg = useColorModeValue("white", "gray.800");
  return (
    <Box maxW="2xl" mx="auto" mt={8} bg={cardBg} borderRadius="xl" boxShadow="lg" p={6}>
      <Heading size="lg" mb={4} color="blue.700">Global AI Chat</Heading>
      <AIChat auth={auth} />
    </Box>
  );
};

export default GlobalChat;
