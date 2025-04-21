import React, { useState } from "react";
import {
  Box,
  Heading,
  VStack,
  Switch,
  FormControl,
  FormLabel,
  useColorMode,
  useColorModeValue,
  Flex,
  Divider,
  Text,
  Button
} from "@chakra-ui/react";

const Settings: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [notifications, setNotifications] = useState(true);
  const cardBg = useColorModeValue("white", "gray.800");
  const cardShadow = useColorModeValue("md", "dark-lg");

  return (
    <Flex minH="100vh" align="center" justify="center" bg={useColorModeValue("gray.50", "gray.900")}> 
      <Box maxW="md" w="100%" p={8} borderRadius={"xl"} boxShadow={cardShadow} bg={cardBg}>
        <Heading size="lg" mb={6} color="blue.700">Settings</Heading>
        <VStack align="stretch" spacing={6}>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="theme-switch" mb="0">Dark Mode</FormLabel>
            <Switch id="theme-switch" isChecked={colorMode === "dark"} onChange={toggleColorMode} />
          </FormControl>
          <Divider />
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="notif-switch" mb="0">Enable Notifications</FormLabel>
            <Switch id="notif-switch" isChecked={notifications} onChange={() => setNotifications(v => !v)} />
          </FormControl>
          <Divider />
          <Box>
            <Text fontWeight="bold" mb={1}>Account Actions</Text>
            <Button colorScheme="red" variant="outline" isDisabled>Delete Account (Coming soon)</Button>
          </Box>
        </VStack>
      </Box>
    </Flex>
  );
};

export default Settings;
