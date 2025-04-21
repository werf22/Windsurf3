import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { TaskForm } from "../components/TaskForm";

const mock = new MockAdapter(axios);

const priorities = [
  { id: 1, name: "Low" },
  { id: 2, name: "High" },
];

describe("TaskForm", () => {
  const dummyAuth = { username: "user", password: "pass" };

  beforeEach(() => {
    mock.reset();
    mock.onGet("/api/priorities").reply(200, priorities);
    mock.onGet("/api/portfolios").reply(200, [{ id: 1, name: "Portfolio1" }]);
    mock.onGet("/api/projects").reply(200, [{ id: 1, name: "Project1" }]);
    mock.onGet("/api/sections").reply(200, [{ id: 1, name: "Section1" }]);
    mock.onPost("/api/tasks").reply(200, {});
  });

  it("shows validation and creates a task", async () => {
    render(<TaskForm auth={dummyAuth} />);
    await waitFor(() => expect(screen.getByText(/Create New Task/i)).toBeInTheDocument());
    // Try to submit with no name
    fireEvent.click(screen.getByText(/Create Task/i));
    expect(screen.queryByText(/Task created successfully/i)).not.toBeInTheDocument();
    // Fill name and submit
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "Test Task" } });
    fireEvent.click(screen.getByText(/Create Task/i));
    await waitFor(() => expect(screen.getByText(/Task created successfully/i)).toBeInTheDocument());
  });

  it("shows error on failure", async () => {
    mock.onPost("/api/tasks").reply(400, { detail: "API error" });
    render(<TaskForm auth={dummyAuth} />);
    await waitFor(() => expect(screen.getByText(/Create New Task/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "Test Task" } });
    fireEvent.click(screen.getByText(/Create Task/i));
    await waitFor(() => expect(screen.getByText(/API error/i)).toBeInTheDocument());
  });
});
