import React, { useState } from "react";
import { Box, Button, Flex, Heading, Text, VStack, HStack, IconButton, useDisclosure, useToast } from "@chakra-ui/react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { SubtaskForm } from "./SubtaskForm";

export interface Subtask {
  id: number;
  name: string;
  description: string;
}

interface TaskDetailSubtasksProps {
  subtasks: Subtask[];
  onAdd: (subtask: { name: string; description: string }) => void;
  onEdit: (id: number, subtask: { name: string; description: string }) => void;
  onDelete: (id: number) => void;
}

export const TaskDetailSubtasks: React.FC<TaskDetailSubtasksProps> = ({ subtasks, onAdd, onEdit, onDelete }) => {
  const [editId, setEditId] = useState<number | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null);

  const handleAdd = (data: { name: string; description: string }) => {
    onAdd(data);
    onClose();
  };
  const handleEdit = (data: { name: string; description: string }) => {
    if (editId !== null) {
      onEdit(editId, data);
      setEditId(null);
      setEditingSubtask(null);
      onClose();
    }
  };
  const handleDelete = (id: number) => {
    onDelete(id);
  };

  return (
    <Box mt={8}>
      <Flex justify="space-between" align="center" mb={2}>
        <Heading size="sm" color="blue.700">Subtasks</Heading>
        <Button leftIcon={<FiPlus />} size="sm" colorScheme="blue" onClick={() => { setModalMode("add"); onOpen(); }}>Add Subtask</Button>
      </Flex>
      <VStack align="stretch" spacing={2}>
        {subtasks.length === 0 && <Text color="gray.400">No subtasks yet.</Text>}
        {subtasks.map(subtask => (
          <HStack key={subtask.id} spacing={2} bg="gray.50" borderRadius="md" p={2}>
            <Box flex={1}>
              <Text fontWeight="bold">{subtask.name}</Text>
              <Text fontSize="sm" color="gray.600">{subtask.description}</Text>
            </Box>
            <IconButton aria-label="Edit" icon={<FiEdit2 />} size="sm" onClick={() => { setModalMode("edit"); setEditId(subtask.id); setEditingSubtask(subtask); onOpen(); }} />
            <IconButton aria-label="Delete" icon={<FiTrash2 />} size="sm" colorScheme="red" onClick={() => handleDelete(subtask.id)} />
          </HStack>
        ))}
      </VStack>
      <SubtaskForm
        isOpen={isOpen}
        onClose={() => { setEditId(null); setEditingSubtask(null); onClose(); }}
        onSubmit={modalMode === "add" ? handleAdd : handleEdit}
        initialData={modalMode === "edit" && editingSubtask ? { name: editingSubtask.name, description: editingSubtask.description ?? "" } : undefined}
        isEditing={modalMode === "edit"}
      />
    </Box>
  );
};
