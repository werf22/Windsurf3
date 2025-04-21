import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast
} from "@chakra-ui/react";

interface SubtaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => void;
  initialData?: { name: string; description: string };
  isEditing?: boolean;
}

export const SubtaskForm: React.FC<SubtaskFormProps> = ({ isOpen, onClose, onSubmit, initialData, isEditing }) => {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSubmit({ name, description });
      toast({ title: isEditing ? "Subtask updated" : "Subtask created", status: "success", duration: 2000, isClosable: true });
      setName("");
      setDescription("");
    }, 500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isEditing ? "Edit Subtask" : "Add Subtask"}</ModalHeader>
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <FormControl mb={4} isRequired isInvalid={!!error && !name.trim()}>
              <FormLabel>Name</FormLabel>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Subtask name" />
              <FormErrorMessage>Name is required.</FormErrorMessage>
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Description</FormLabel>
              <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Subtask description (optional)" />
            </FormControl>
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} mr={3} disabled={loading}>Cancel</Button>
            <Button colorScheme="blue" type="submit" isLoading={loading}>{isEditing ? "Save" : "Add"}</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
