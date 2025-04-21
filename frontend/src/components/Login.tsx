import React, { useState } from "react";
import { Box, Button, Input, Heading, Text, InputGroup, InputLeftElement, Flex, useColorModeValue, FormLabel } from "@chakra-ui/react";
import { FiUser, FiLock } from "react-icons/fi";

interface LoginProps {
  onLogin: (username: string, password: string) => void;
  error?: string;
}

export const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  const cardBg = useColorModeValue("white", "gray.800");
  const cardShadow = useColorModeValue("lg", "dark-lg");

  return (
    <Flex minH="100vh" align="center" justify="center" bg={useColorModeValue("gray.50", "gray.900")}> 
      <Box maxW="sm" w="100%" p={8} borderRadius={12} boxShadow={cardShadow} bg={cardBg}>
        <Heading mb={6} size="lg" textAlign="center" color="blue.700" fontWeight="extrabold">Sign in to your account</Heading>
        <form onSubmit={handleSubmit} aria-label="Login Form">
          <Box mb={4}>
            <FormLabel htmlFor="login-username" mb={1} fontWeight="bold">Username</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiUser color="#3182ce" />
              </InputLeftElement>
              <Input
                id="login-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
                placeholder="Enter your username"
                bg={useColorModeValue("gray.100", "gray.700")}
              />
            </InputGroup>
          </Box>
          <Box mb={4}>
            <FormLabel htmlFor="login-password" mb={1} fontWeight="bold">Password</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiLock color="#3182ce" />
              </InputLeftElement>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                bg={useColorModeValue("gray.100", "gray.700")}
              />
            </InputGroup>
          </Box>
          {error && <Text color="red.500" mb={4} textAlign="center">{error}</Text>}
          <Button colorScheme="blue" width="100%" type="submit" size="lg" fontWeight="bold">Login</Button>
        </form>
        <Text mt={6} color="gray.500" fontSize="sm" textAlign="center">Don’t have an account? <a href="/register" style={{ color: '#3182ce', cursor: 'pointer' }}>Sign up</a></Text>
      </Box>
    </Flex>
  );
};
