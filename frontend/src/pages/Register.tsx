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
  FormControl,
  FormLabel,
  FormErrorMessage
} from "@chakra-ui/react";
import { FiUser, FiLock, FiMail } from "react-icons/fi";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    // Placeholder for API call
    setTimeout(() => {
      if (username.length < 3 || password.length < 6 || !email.includes("@")) {
        setError("Please enter a valid username, email, and password (min 6 chars).");
        setLoading(false);
        return;
      }
      setSuccess(true);
      setLoading(false);
    }, 800);
  };

  const cardBg = useColorModeValue("white", "gray.800");
  const cardShadow = useColorModeValue("lg", "dark-lg");

  return (
    <Flex minH="100vh" align="center" justify="center" bg={useColorModeValue("gray.50", "gray.900")}> 
      <Box maxW="sm" w="100%" p={8} borderRadius={12} boxShadow={cardShadow} bg={cardBg}>
        <Heading mb={6} size="lg" textAlign="center" color="blue.700" fontWeight="extrabold">Create your account</Heading>
        <form onSubmit={handleSubmit} aria-label="Register Form">
          <FormControl mb={4} isRequired isInvalid={!!error && username.length < 3}>
            <FormLabel>Username</FormLabel>
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
                placeholder="Choose a username"
                bg={useColorModeValue("gray.100", "gray.700")}
              />
            </InputGroup>
            <FormErrorMessage>Username must be at least 3 characters.</FormErrorMessage>
          </FormControl>
          <FormControl mb={4} isRequired isInvalid={!!error && !email.includes("@") }>
            <FormLabel>Email</FormLabel>
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
                placeholder="Enter your email"
                bg={useColorModeValue("gray.100", "gray.700")}
              />
            </InputGroup>
            <FormErrorMessage>Email must be valid.</FormErrorMessage>
          </FormControl>
          <FormControl mb={4} isRequired isInvalid={!!error && password.length < 6}>
            <FormLabel>Password</FormLabel>
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
                placeholder="Create a password"
                bg={useColorModeValue("gray.100", "gray.700")}
              />
            </InputGroup>
            <FormErrorMessage>Password must be at least 6 characters.</FormErrorMessage>
          </FormControl>
          {error && <Text color="red.500" mb={4} textAlign="center">{error}</Text>}
          {success && <Text color="green.500" mb={4} textAlign="center">Account created! You can now sign in.</Text>}
          <Button colorScheme="blue" width="100%" type="submit" size="lg" fontWeight="bold" isLoading={loading}>Register</Button>
        </form>
        <Text mt={6} color="gray.500" fontSize="sm" textAlign="center">Already have an account? <a href="/" style={{ color: '#3182ce', cursor: 'pointer' }}>Login</a></Text>
      </Box>
    </Flex>
  );
};

export default Register;
