import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { TaskRow } from "../components/TaskRow";

const mock = new MockAdapter(axios);

const priorities = [
  { id: 1, name: "Low" },
  { id: 2, name: "High" },
];

const task = {
  id: 1,
  name: "Test Task",
  description: "desc",
  due_date: "2025-04-20",
  priority_id: 2,
};

describe("TaskRow", () => {
  beforeEach(() => {
    mock.reset();
    mock.onGet("/api/priorities").reply(200, priorities);
    mock.onGet("/api/portfolios").reply(200, [{ id: 1, name: "Portfolio1" }]);
    mock.onGet("/api/projects").reply(200, [{ id: 1, name: "Project1" }]);
    mock.onGet("/api/sections").reply(200, [{ id: 1, name: "Section1" }]);
  });

  it("renders and allows editing a task", async () => {
    mock.onPatch("/api/tasks/1").reply(200, {});
    const onUpdate = jest.fn();
    render(<table><tbody><TaskRow task={task} onUpdate={onUpdate} /></tbody></table>);
    expect(screen.getByText("Test Task")).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Edit/i));
    await waitFor(() => expect(screen.getByDisplayValue("Test Task")).toBeInTheDocument());
    fireEvent.change(screen.getByDisplayValue("Test Task"), { target: { value: "Updated Task" } });
    fireEvent.click(screen.getByText(/Save/i));
    await waitFor(() => expect(screen.getByText(/Task updated!/i)).toBeInTheDocument());
    expect(onUpdate).toHaveBeenCalled();
  });

  it("shows error on update failure", async () => {
    mock.onPatch("/api/tasks/1").reply(500);
    render(<table><tbody><TaskRow task={task} onUpdate={() => {}} /></tbody></table>);
    fireEvent.click(screen.getByText(/Edit/i));
    await waitFor(() => expect(screen.getByDisplayValue("Test Task")).toBeInTheDocument());
    fireEvent.change(screen.getByDisplayValue("Test Task"), { target: { value: "Updated Task" } });
    fireEvent.click(screen.getByText(/Save/i));
    await waitFor(() => expect(screen.getByText(/Failed to update task/i)).toBeInTheDocument());
  });

  it("shows notification on delete", async () => {
    window.confirm = jest.fn(() => true);
    mock.onDelete("/api/tasks/1").reply(200, {});
    const onUpdate = jest.fn();
    render(<table><tbody><TaskRow task={task} onUpdate={onUpdate} /></tbody></table>);
    fireEvent.click(screen.getByText(/Delete/i));
    await waitFor(() => expect(screen.getByText(/Task deleted!/i)).toBeInTheDocument());
    expect(onUpdate).toHaveBeenCalled();
  });

  it("shows error on delete failure", async () => {
    window.confirm = jest.fn(() => true);
    mock.onDelete("/api/tasks/1").reply(500);
    render(<table><tbody><TaskRow task={task} onUpdate={() => {}} /></tbody></table>);
    fireEvent.click(screen.getByText(/Delete/i));
    await waitFor(() => expect(screen.getByText(/Failed to delete task/i)).toBeInTheDocument());
  });
});
