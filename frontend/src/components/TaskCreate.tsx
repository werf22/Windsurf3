import React, { useState } from "react";
import { Box, Button, Input, Textarea, FormControl, FormLabel, Text } from "@chakra-ui/react";

interface TaskCreateProps {
  auth: { username: string; password: string };
  onCreated?: () => void;
}

export const TaskCreate: React.FC<TaskCreateProps> = ({ auth, onCreated }) => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAISuggest = async () => {
    setError(null);
    try {
      const resp = await fetch("/api/ai-categorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization":
            "Basic " + btoa(`${auth.username}:${auth.password}`)
        },
        body: JSON.stringify({ name, description, due_date: dueDate })
      });
      if (resp.ok) {
        const data = await resp.json();
        setAiSuggestions(data);
      } else {
        setError("AI suggestion failed");
      }
    } catch {
      setError("AI suggestion failed");
    }
  };

  const handleCreate = async () => {
    if (!aiSuggestions) return;
    try {
      const payload = { name, description, due_date: dueDate, ...aiSuggestions };
      const resp = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization":
            "Basic " + btoa(`${auth.username}:${auth.password}`)
        },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        setSuccess("Task created!");
        onCreated?.();
      }
    } catch {
      setError("Task creation failed");
    }
  };

  const handleSimpleCreate = async () => {
    setError(null);
    try {
      const payload = { name, description, due_date: dueDate };
      const resp = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization":
            "Basic " + btoa(`${auth.username}:${auth.password}`)
        },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        setSuccess("Task created!");
        onCreated?.();
      } else {
        setError("Task creation failed");
      }
    } catch {
      setError("Task creation failed");
    }
  };

  return (
    <Box>
      <FormControl>
        <FormLabel htmlFor="name">Task Name</FormLabel>
        <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Task Name" />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="description">Description</FormLabel>
        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="due_date">Due Date</FormLabel>
        <Input id="due_date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
      </FormControl>
      <Button onClick={handleAISuggest} mt={4}>Suggest with AI</Button>
      <Button onClick={handleSimpleCreate} mt={4} ml={2}>Quick Create</Button>
      {error && <Text color="red.500" mt={2}>{error}</Text>}
      {aiSuggestions && (
        <>
          <FormControl mt={4}>
            <FormLabel htmlFor="portfolio_id">Portfolio ID</FormLabel>
            <Input id="portfolio_id" name="portfolio_id" value={aiSuggestions.portfolio_id || ""} onChange={e => setAiSuggestions((prev: any) => ({ ...prev, portfolio_id: e.target.value }))} />
          </FormControl>
          <Button onClick={handleCreate} mt={4}>Create Task</Button>
        </>
      )}
      {success && <Text color="green.500" mt={2}>{success}</Text>}
    </Box>
  );
};
