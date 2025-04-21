import React, { useState } from "react";
import {
  Box,
  Avatar,
  Heading,
  Text,
  Button,
  VStack,
  Input,
  useColorModeValue,
  Flex,
  Divider,
  InputGroup,
  InputLeftElement,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure
} from "@chakra-ui/react";
import { FiUser, FiEdit2, FiMail, FiLock } from "react-icons/fi";

export const Profile: React.FC = () => {
  // Placeholder user data (replace with real user info from API or context)
  const [username, setUsername] = useState("demo_user");
  const [email, setEmail] = useState("demo@example.com");
  const [editing, setEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const cardBg = useColorModeValue("white", "gray.800");
  const cardShadow = useColorModeValue("md", "dark-lg");

  const handleSave = async () => {
    setError(null);
    setSuccess(false);
    setLoading(true);
    // Validation
    if (!username || !email.includes("@")) {
      setError("Please enter a valid username and email."); setLoading(false); return;
    }
    if (newPassword || confirmPassword || currentPassword) {
      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters."); setLoading(false); return;
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match."); setLoading(false); return;
      }
      if (!currentPassword) {
        setError("Enter your current password to change password."); setLoading(false); return;
      }
    }
    // Placeholder for API call
    setTimeout(() => {
      setSuccess(true);
      setEditing(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setLoading(false);
    }, 800);
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    setDeleteLoading(true);
    // Placeholder for API call
    setTimeout(() => {
      // Simulate error or success
      setDeleteLoading(false);
      window.location.href = "/register"; // Simulate logout/redirect
    }, 1200);
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg={useColorModeValue("gray.50", "gray.900")}> 
      <Box maxW="md" w="100%" p={8} borderRadius={"xl"} boxShadow={cardShadow} bg={cardBg}>
        <VStack spacing={6} align="stretch">
          <Flex align="center" gap={4} mb={2}>
            <Avatar size="xl" icon={<FiUser fontSize="2rem" />} name={username} />
            <Box>
              <Heading size="lg" color="blue.700">Profile</Heading>
              <Text color="gray.500">Manage your account info</Text>
            </Box>
          </Flex>
          <Divider />
          <Box>
            <Text fontWeight="bold" mb={1}>Username</Text>
            {editing ? (
              <Input value={username} onChange={e => setUsername(e.target.value)} />
            ) : (
              <Flex align="center" gap={2}><FiUser /> <Text>{username}</Text></Flex>
            )}
          </Box>
          <Box>
            <Text fontWeight="bold" mb={1}>Email</Text>
            {editing ? (
              <Input value={email} onChange={e => setEmail(e.target.value)} />
            ) : (
              <Flex align="center" gap={2}><FiMail /> <Text>{email}</Text></Flex>
            )}
          </Box>
          {editing && (
            <Box>
              <Text fontWeight="bold" mb={1}>Change Password</Text>
              <FormControl mb={2}>
                <FormLabel fontWeight="normal">Current Password</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none"><FiLock color="#3182ce" /></InputLeftElement>
                  <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current password" autoComplete="current-password" />
                </InputGroup>
              </FormControl>
              <FormControl mb={2} isInvalid={!!error && newPassword.length > 0 && newPassword.length < 6}>
                <FormLabel fontWeight="normal">New Password</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none"><FiLock color="#3182ce" /></InputLeftElement>
                  <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password (min 6 chars)" autoComplete="new-password" />
                </InputGroup>
                <FormErrorMessage>Password must be at least 6 characters.</FormErrorMessage>
              </FormControl>
              <FormControl mb={2} isInvalid={!!error && confirmPassword !== newPassword}>
                <FormLabel fontWeight="normal">Confirm New Password</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none"><FiLock color="#3182ce" /></InputLeftElement>
                  <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" autoComplete="new-password" />
                </InputGroup>
                <FormErrorMessage>Passwords do not match.</FormErrorMessage>
              </FormControl>
            </Box>
          )}
          <Divider />
          {error && <Alert status="error"><AlertIcon />{error}</Alert>}
          {success && <Alert status="success"><AlertIcon />Profile updated!</Alert>}
          <Flex gap={4}>
            <Button colorScheme="blue" leftIcon={<FiEdit2 />} onClick={() => { if (editing) handleSave(); else setEditing(true); }} isLoading={loading}>{editing ? "Save" : "Edit"}</Button>
            <Button variant="outline" colorScheme="gray" isDisabled={!editing}>Change Password</Button>
            <Button colorScheme="red" variant="outline" onClick={onOpen}>Delete Account</Button>
          </Flex>
          <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Delete Account</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text mb={4}>Are you sure you want to permanently delete your account and all associated tasks? This action cannot be undone.</Text>
                {deleteError && <Alert status="error"><AlertIcon />{deleteError}</Alert>}
              </ModalBody>
              <ModalFooter>
                <Button onClick={onClose} mr={3} disabled={deleteLoading}>Cancel</Button>
                <Button colorScheme="red" onClick={handleDeleteAccount} isLoading={deleteLoading}>Delete</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          <Box mt={6} color="gray.400" fontSize="sm" textAlign="center">
            More settings coming soon...
          </Box>
        </VStack>
      </Box>
    </Flex>
  );
};

export default Profile;
