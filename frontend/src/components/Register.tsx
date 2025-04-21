import React, { useState } from "react";
import {
  Box,
  Button,
  Input,
  Heading,
  Text,
  InputGroup,
  InputLeftElement,
  Flex,
  useColorModeValue,
  FormLabel
} from "@chakra-ui/react";
import { FiUser, FiMail, FiLock } from "react-icons/fi";

interface RegisterProps {
  onRegister: (username: string, email: string, password: string) => void;
  error?: string;
}

export const Register: React.FC<RegisterProps> = ({ onRegister, error }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!username.trim() || !email.trim() || !password.trim()) {
      setLocalError("All fields are required.");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setLocalError("Invalid email address.");
      return;
    }
    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    onRegister(username, email, password);
  };

  const cardBg = useColorModeValue("white", "gray.800");
  const cardShadow = useColorModeValue("lg", "dark-lg");

  return (
    <Flex minH="100vh" align="center" justify="center" bg={useColorModeValue("gray.50", "gray.900")}> 
      <Box maxW="sm" w="100%" p={8} borderRadius={12} boxShadow={cardShadow} bg={cardBg}>
        <Heading mb={6} size="lg" textAlign="center" color="blue.700" fontWeight="extrabold">Create your account</Heading>
        <form onSubmit={handleSubmit} aria-label="Register Form">
          <Box mb={4}>
            <FormLabel htmlFor="register-username" mb={1} fontWeight="bold">Username</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiUser color="#3182ce" />
              </InputLeftElement>
              <Input
                id="register-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
                placeholder="Choose a username"
                bg={useColorModeValue("gray.100", "gray.700")}
              />
            </InputGroup>
          </Box>
          <Box mb={4}>
            <FormLabel htmlFor="register-email" mb={1} fontWeight="bold">Email</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiMail color="#3182ce" />
              </InputLeftElement>
              <Input
                id="register-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
                placeholder="Enter your email"
                bg={useColorModeValue("gray.100", "gray.700")}
              />
            </InputGroup>
          </Box>
          <Box mb={4}>
            <FormLabel htmlFor="register-password" mb={1} fontWeight="bold">Password</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiLock color="#3182ce" />
              </InputLeftElement>
              <Input
                id="register-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                placeholder="Create a password"
                bg={useColorModeValue("gray.100", "gray.700")}
              />
            </InputGroup>
          </Box>
          <Box mb={4}>
            <FormLabel htmlFor="register-confirm-password" mb={1} fontWeight="bold">Confirm Password</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiLock color="#3182ce" />
              </InputLeftElement>
              <Input
                id="register-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                placeholder="Confirm your password"
                bg={useColorModeValue("gray.100", "gray.700")}
              />
            </InputGroup>
          </Box>
          {(localError || error) && <Text color="red.500" mb={4} textAlign="center">{localError || error}</Text>}
          <Button colorScheme="blue" width="100%" type="submit" size="lg" fontWeight="bold">Sign Up</Button>
        </form>
        <Text mt={6} color="gray.500" fontSize="sm" textAlign="center">Already have an account? <a href="/login" style={{ color: '#3182ce', cursor: 'pointer' }}>Sign in</a></Text>
      </Box>
    </Flex>
  );
};
