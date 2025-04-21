import React from "react";
import {
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
  Box,
  Text,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure
} from "@chakra-ui/react";
import { FiUser, FiLogOut, FiTrash2 } from "react-icons/fi";

interface ProfileMenuProps {
  username: string;
  fullName?: string;
  email?: string;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ username, fullName, email, onLogout, onDeleteAccount }) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<any>();

  return (
    <Menu>
      <MenuButton as={Button} rounded="full" variant="ghost" cursor="pointer" minW={0} aria-label="Open profile menu">
        <Avatar size="sm" icon={<FiUser />} />
      </MenuButton>
      <MenuList>
        <Box px={3} py={2}>
          <Text fontWeight="bold">{fullName || username}</Text>
          <Text fontSize="sm" color="gray.500">{email || username}</Text>
        </Box>
        <MenuDivider />
        <MenuItem icon={<FiLogOut />} onClick={onLogout}>Log Out</MenuItem>
        <MenuItem icon={<FiTrash2 />} color="red.500" onClick={onOpen}>Delete Account</MenuItem>
      </MenuList>
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Account
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>Cancel</Button>
              <Button colorScheme="red" onClick={() => { onDeleteAccount(); onClose(); }} ml={3}>Delete</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Menu>
  );
};
