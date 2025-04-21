import React from "react";
import { Alert, AlertIcon, Box, useColorModeValue } from "@chakra-ui/react";

export interface NotificationProps {
  message: string;
  type?: "success" | "error";
}

export const Notification: React.FC<NotificationProps> = ({ message, type = "success" }) => {
  if (!message) return null;
  const bg = useColorModeValue(
    type === "success" ? "#d4edda" : "#f8d7da",
    type === "success" ? "#155724" : "#721c24"
  );
  return (
    <Box my={4}>
      <Alert status={type} variant="left-accent" style={{ background: bg }} borderRadius="md" fontWeight={500}>
        <AlertIcon />
        {message}
      </Alert>
    </Box>
  );
};
