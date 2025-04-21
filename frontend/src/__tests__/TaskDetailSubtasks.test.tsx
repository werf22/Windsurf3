import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TaskDetail } from "../components/TaskDetail";

// Mock axios for subtask API calls
jest.mock("axios", () => ({
  get: jest.fn(() => Promise.resolve({ data: [
    { id: 101, name: "Subtask 1", description: "Subtask Desc 1", parent_task_id: 1 },
    { id: 102, name: "Subtask 2", description: "Subtask Desc 2", parent_task_id: 1 }
  ] })),
  post: jest.fn((url, data) => Promise.resolve({ data: { id: 103, ...data, parent_task_id: 1 } })),
  patch: jest.fn((url, data) => Promise.resolve({ data: { id: 101, ...data, parent_task_id: 1 } })),
  delete: jest.fn(() => Promise.resolve({})),
}));

const mockTask = {
  id: 1,
  name: "Test Task",
  description: "Test Desc"
};

const staticAuth = { username: "jakub", password: "cerulik123" };

// Patch global.fetch to return a real Response object
let subtasks = [
  { id: 101, name: "Subtask 1", description: "Subtask Desc 1", parent_task_id: 1 },
  { id: 102, name: "Subtask 2", description: "Subtask Desc 2", parent_task_id: 1 }
];
beforeAll(() => {
  global.fetch = jest.fn((input: RequestInfo | URL, opts?: RequestInit) => {
    const url = typeof input === 'string' ? input : '' + input;
    const method = opts?.method || 'GET';
    // Log every fetch for debugging
    // eslint-disable-next-line no-console
    console.log('FETCH URL:', url, 'METHOD:', method);
    if (url.includes("/api/tasks/1/subtasks") && method === 'GET') {
      return Promise.resolve(new Response(JSON.stringify(subtasks), { status: 200 }));
    }
    if (url.includes("/api/tasks/1/subtasks") && method === 'POST') {
      const body = opts?.body ? JSON.parse(opts.body as string) : {};
      const newSubtask = { id: Math.max(...subtasks.map(s => s.id)) + 1, ...body, parent_task_id: 1 };
      subtasks.push(newSubtask);
      setTimeout(() => {}, 0); // simulate async
      return Promise.resolve(new Response(JSON.stringify(newSubtask), { status: 200 }));
    }
    const patchMatch = url.match(/\/api\/subtasks\/(\d+)/);
    if (patchMatch && method === 'PATCH') {
      const id = parseInt(patchMatch[1], 10);
      const body = opts?.body ? JSON.parse(opts.body as string) : {};
      const idx = subtasks.findIndex(s => s.id === id);
      if (idx !== -1) {
        subtasks[idx] = { ...subtasks[idx], ...body };
      }
      return Promise.resolve(new Response(JSON.stringify(subtasks[idx]), { status: 200 }));
    }
    if (url.includes("/api/tasks/1") && !url.includes("subtasks")) {
      return Promise.resolve(new Response(JSON.stringify(mockTask), { status: 200 }));
    }
    return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
  }) as typeof fetch;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("TaskDetail subtasks integration", () => {
  it("renders subtasks", async () => {
    console.log("Rendering TaskDetail component");
    render(<TaskDetail taskId={1} auth={staticAuth} onSaved={() => {}} />);
    await waitFor(() => expect(screen.getByDisplayValue("Test Task")).toBeInTheDocument());
    console.log("TaskDetail component rendered");
    await waitFor(() => expect(screen.queryAllByText(/Subtask 1/i).length).toBeGreaterThan(0));
    expect(screen.queryAllByText(/Subtask 2/i).length).toBeGreaterThan(0);
  });

  it("adds a subtask", async () => {
    console.log("Adding a new subtask");
    render(<TaskDetail taskId={1} auth={staticAuth} onSaved={() => {}} />);
    await waitFor(() => expect(screen.getByDisplayValue("Test Task")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Add Subtask"));
    fireEvent.change(screen.getByPlaceholderText("Subtask name"), { target: { value: "New Subtask" } });
    fireEvent.change(screen.getByPlaceholderText("Subtask description (optional)"), { target: { value: "Desc new" } });
    fireEvent.click(screen.getByText("Add"));
    await waitFor(() => expect(screen.queryAllByText(/New Subtask/i).length).toBeGreaterThan(0));
    console.log("New subtask added");
  });

  it("edits a subtask", async () => {
    console.log("Editing a subtask");
    render(<TaskDetail taskId={1} auth={staticAuth} onSaved={() => {}} />);
    await waitFor(() => expect(screen.getByDisplayValue("Test Task")).toBeInTheDocument());
    await waitFor(() => expect(screen.queryAllByText(/Subtask 1/i).length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByLabelText("Edit")[0]);
    fireEvent.change(screen.getByPlaceholderText("Subtask name"), { target: { value: "Subtask 1 Edited" } });
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() => expect(screen.getByText("Subtask 1 Edited")).toBeInTheDocument());
    console.log("Subtask edited");
  });

  it("deletes a subtask", async () => {
    console.log("Deleting a subtask");
    render(<TaskDetail taskId={1} auth={staticAuth} onSaved={() => {}} />);
    await waitFor(() => expect(screen.getByDisplayValue("Test Task")).toBeInTheDocument());
    await waitFor(() => expect(screen.queryAllByText(/Subtask 1/i).length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByLabelText("Delete")[0]);
    await waitFor(() => expect(screen.queryByText("Subtask 1")).not.toBeInTheDocument());
    console.log("Subtask deleted");
  });
});
