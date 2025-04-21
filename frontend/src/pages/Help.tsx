import React from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Divider,
  List,
  ListItem,
  ListIcon,
  Link,
  useColorModeValue
} from "@chakra-ui/react";
import { FiHelpCircle, FiBookOpen, FiMail, FiCheckCircle } from "react-icons/fi";

const Help: React.FC = () => {
  const cardBg = useColorModeValue("white", "gray.800");
  const cardShadow = useColorModeValue("md", "dark-lg");

  return (
    <Box maxW="lg" mx="auto" bg={cardBg} boxShadow={cardShadow} borderRadius="xl" p={8} mt={8}>
      <Heading size="lg" mb={4} color="blue.700">
        <FiHelpCircle style={{ marginRight: 8, display: "inline" }} /> Help & About
      </Heading>
      <Divider my={4} />
      <VStack align="stretch" spacing={4}>
        <Text fontWeight="bold">Feature Tour</Text>
        <List spacing={2}>
          <ListItem><ListIcon as={FiCheckCircle} color="green.400" /> Modern dashboard with stats and deadlines</ListItem>
          <ListItem><ListIcon as={FiCheckCircle} color="green.400" /> Hierarchical navigation (Portfolio → Project → Section → Task)</ListItem>
          <ListItem><ListIcon as={FiCheckCircle} color="green.400" /> AI-powered global and per-task chat</ListItem>
          <ListItem><ListIcon as={FiCheckCircle} color="green.400" /> Profile, settings, and authentication flows</ListItem>
          <ListItem><ListIcon as={FiCheckCircle} color="green.400" /> CSV import/export, filtering, sorting, batch actions</ListItem>
        </List>
        <Divider />
        <Text fontWeight="bold">FAQ</Text>
        <List spacing={2}>
          <ListItem>
            <ListIcon as={FiBookOpen} color="blue.400" />
            <b>How do I reset my password?</b> Use the Profile page ("Change Password") or contact support.
          </ListItem>
          <ListItem>
            <ListIcon as={FiBookOpen} color="blue.400" />
            <b>How do I import/export tasks?</b> Use the CSV controls on the Dashboard or Task Table.
          </ListItem>
          <ListItem>
            <ListIcon as={FiBookOpen} color="blue.400" />
            <b>How do I get AI suggestions?</b> Use the "AI Suggest" button in task creation or chat with the AI bot.
          </ListItem>
        </List>
        <Divider />
        <Text fontWeight="bold">Contact</Text>
        <Text>
          <ListIcon as={FiMail} color="purple.400" />
          For help, bug reports, or feature requests, email:
          <Link href="mailto:support@cerulik.ai" color="blue.500"> support@cerulik.ai</Link>
        </Text>
      </VStack>
    </Box>
  );
};

export default Help;
