// @ts-nocheck
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { TaskDetail } from "../src/components/TaskDetail";
import { TASK_FIELD_CONFIG } from "../src/components/taskFieldConfig";

declare const global: any;
declare const jest: any;

// Utility to flush all pending promises (ensures useEffect + fetch complete)
const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

// Initial chat history data
const initialChatHistory = [
  { sender: "user", message: "Hi" },
  { sender: "ai", message: "Hello!" },
];
let mockChatHistory = [...initialChatHistory];

beforeEach(() => {
  mockChatHistory = [...initialChatHistory];
  jest.spyOn(global, "fetch").mockImplementation((url, options) => {
    // eslint-disable-next-line no-console
    console.log("FETCH URL:", url, "METHOD:", options?.method);
    // Handle /api/tasks/42 GET (options undefined or method GET)
    if (url === "/api/tasks/42" && (!options || !options.method || options.method === "GET")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 42,
          name: "Test Task",
          description: "Test Desc",
          due_date: "2025-04-20",
          priority: "High",
          portfolio: "Portfolio A",
          project: "Project X",
          sections: "Section 1",
          tags: "tag1,tag2",
          assignee: "John Doe",
          ai_workflow_status: "open",
          created_at: "2025-04-10",
          completed_at: null,
          last_modified_at: "2025-04-15"
        }),
      });
    }
    // Handle /api/tasks/42 PUT or PATCH (save)
    if (url === "/api/tasks/42" && (options?.method === "PUT" || options?.method === "PATCH")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
    }
    // Handle /api/tasks/42/chat GET
    if (url === "/api/tasks/42/chat" && (!options || !options.method || options.method === "GET")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([...mockChatHistory]),
      });
    }
    // Handle /api/options/*
    if (url && url.includes("/api/options/")) {
      return Promise.resolve({
        json: () => Promise.resolve([
          { id: 1, name: "A" },
          { id: 2, name: "B" },
          { id: 3, name: "C" },
          { id: 4, name: "D" },
          { id: 5, name: "E" }
        ])
      });
    }
    // Handle /api/tasks/42/chat POST (send message)
    if (url === "/api/tasks/42/chat" && options?.method === "POST") {
      const { message } = JSON.parse(options.body);
      mockChatHistory.push({ sender: "user", message });
      mockChatHistory.push({ sender: "ai", message: "ai reply!" });
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([...mockChatHistory]),
      });
    }
    // Handle /api/tasks/42 POST (not used, but safe fallback)
    if (url === "/api/tasks/42" && options?.method === "POST") {
      return Promise.resolve({ ok: true });
    }
    return Promise.reject(new Error("Unknown endpoint"));
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe("TaskDetail", () => {
  it("renders and edits a task", async () => {
    const mockBack = jest.fn();
    const mockSaved = jest.fn();
    let container;
    await act(async () => {
      container = render(<TaskDetail taskId={42} auth={{ username: "u", password: "p" }} onBack={mockBack} onSaved={mockSaved} />).container;
    });
    // Only check for fields that are present in both TASK_FIELD_CONFIG and the mock task data, and are rendered by the UI
    const presentFields = [
      "id",
      "name",
      "description",
      "due_date",
      "priority",
      "portfolio",
      "project",
      "sections",
      "tags",
      "assignee",
      "ai_workflow_status",
      "created_at",
      "completed_at",
      "last_modified_at"
    ];
    const renderedTypes = ["text", "textarea", "dropdown"];
    presentFields.forEach((fieldKey) => {
      const config = TASK_FIELD_CONFIG[fieldKey];
      if (config && config.label && renderedTypes.includes(config.type)) {
        const foundCount = screen.queryAllByLabelText(new RegExp(config.label, "i")).length;
        if (foundCount === 0) {
          // eslint-disable-next-line no-console
          console.error(`Field label not found in UI: ${config.label} (key: ${fieldKey})`);
        }
        expect(foundCount).toBeGreaterThan(0);
      }
    });

    await act(async () => { await screen.findByDisplayValue("Test Task"); });
    // Skipping description field test as it may be rendered as textarea or input, which can differ

    try {
      console.log('Before change event');
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "Changed Task" } });
        console.log('After change event, before save');
        fireEvent.click(screen.getByText(/Save Changes/i));
      });
      console.log('After save click, before waitFor');
      await waitFor(() => expect(mockSaved).toHaveBeenCalled());
      console.log('After waitFor mockSaved, before Task updated');
      expect(screen.getByText("Task updated!"));
      console.log('After Task updated, before Back to List');
      fireEvent.click(screen.getByText(/Back to List/i));
      console.log('After Back to List click, before expect mockBack');
      expect(mockBack).toHaveBeenCalled();
      console.log('TEST COMPLETE');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Edit/save section failed:', e);
      throw e;
    }
  });

  it("shows and sends chat messages", async () => {
    const { container } = render(<TaskDetail taskId={42} auth={{ username: "u", password: "p" }} />);
    await act(flushPromises); await act(flushPromises);
    await screen.findByDisplayValue("Test Task");
    // Wait for chat area to appear
    await screen.findByText("Task-Specific Chat");
    // Wait for initial chat messages
    await waitFor(() => {
      const youSpans = screen.getAllByText("You:");
      const aiSpans = screen.getAllByText("AI:");
      expect(youSpans.some(span => span.parentElement?.textContent?.replace(/\s+/g, ' ').includes("You: Hi"))).toBe(true);
      expect(aiSpans.some(span => span.parentElement?.textContent?.replace(/\s+/g, ' ').includes("AI: Hello!"))).toBe(true);
    });
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Type your message/i), { target: { value: "How are you?" } });
      fireEvent.click(screen.getByText(/Send/i));
    });
    await act(flushPromises); await act(flushPromises);
    // Wait for sent message and AI reply
    await waitFor(() => {
      const youSpans = screen.getAllByText("You:");
      const aiSpans = screen.getAllByText("AI:");
      expect(youSpans.some(span => span.parentElement?.textContent?.replace(/\s+/g, ' ').includes("You: How are you?"))).toBe(true);
      expect(aiSpans.some(span => span.parentElement?.textContent?.replace(/\s+/g, ' ').includes("AI: ai reply!"))).toBe(true);
    });
  });
});
