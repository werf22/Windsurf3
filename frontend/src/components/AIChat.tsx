import React, { useState } from "react";
import axios from "axios";
import { Box, Button, Flex, Heading, Input, Text, VStack, useColorModeValue, Spinner, Avatar, HStack } from "@chakra-ui/react";
import { FiSend, FiUser, FiCpu } from "react-icons/fi";

interface ChatMessage {
  from: "user" | "ai";
  text: string;
}

interface AIChatProps {
  auth: { username: string; password: string };
}

export const AIChat: React.FC<AIChatProps> = ({ auth }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const cardBg = useColorModeValue("white", "gray.800");
  const cardShadow = useColorModeValue("md", "dark-lg");

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { from: "user", text: input }]);
    setLoading(true);
    try {
      // Try AI edit endpoint first (for edit commands)
      const authHeader = auth ? { Authorization: 'Basic ' + btoa(`${auth.username}:${auth.password}`) } : {};
      const editRes = await axios.post("/api/ai-edit", { message: input }, { headers: authHeader });
      if (editRes.data && editRes.data.response && editRes.data.task) {
        setMessages((msgs) => [...msgs, { from: "ai", text: editRes.data.response }]);
      } else if (editRes.data && editRes.data.response) {
        setMessages((msgs) => [...msgs, { from: "ai", text: editRes.data.response }]);
      } else {
        // fallback to chat endpoint if not an edit
        const res = await axios.post("/api/chat", { message: input }, { headers: authHeader });
        setMessages((msgs) => [...msgs, { from: "ai", text: res.data.response }]);
      }
    } catch (err) {
      setMessages((msgs) => [...msgs, { from: "ai", text: "[Error contacting AI]" }]);
    }
    setInput("");
    setLoading(false);
  };

  return (
    <Box maxW="lg" mx="auto" bg={cardBg} boxShadow={cardShadow} borderRadius="xl" p={8} mt={8}>
      <Heading size="md" mb={4} color="blue.700">AI Chat</Heading>
      <Box minH={80} mb={4} role="log">
        {messages.length === 0 && <Text color="gray.400">Chat with your AI assistant here to edit or plan your tasks.</Text>}
        <VStack align="stretch" spacing={2}>
          {messages.map((msg, i) => (
            <HStack key={i} justify={msg.from === "user" ? "flex-end" : "flex-start"}>
              {msg.from === "ai" && <Avatar size="xs" icon={<FiCpu />} bg="blue.500" color="white" />}
              <Box bg={msg.from === "user" ? "blue.50" : "gray.100"} color="gray.800" px={3} py={2} borderRadius="md" maxW="80%">
                <Text fontSize="sm">{msg.from === "user" ? `You: ${msg.text}` : `AI: ${msg.text}`}</Text>
              </Box>
              {msg.from === "user" && <Avatar size="xs" icon={<FiUser />} bg="gray.500" color="white" />}
            </HStack>
          ))}
          {loading && <HStack justify="flex-start"><Spinner size="sm" color="blue.500" /><Text color="gray.400">AI is typing...</Text></HStack>}
        </VStack>
      </Box>
      <form onSubmit={sendMessage} aria-label="Send message to AI">
        <Flex gap={2}>
          <Input
            aria-label="Message to AI"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            bg={useColorModeValue("gray.100", "gray.700")}
            disabled={loading}
          />
          <Button type="submit" colorScheme="blue" leftIcon={<FiSend />} isLoading={loading} isDisabled={loading || !input.trim()}>
            Send
          </Button>
        </Flex>
      </form>
    </Box>
  );
};
