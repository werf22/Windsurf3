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
const portfolios = [
  { id: 1, name: "Portfolio A" },
  { id: 2, name: "Portfolio B" },
];
const projects = [
  { id: 1, name: "Project X", portfolio_id: 1 },
  { id: 2, name: "Project Y", portfolio_id: 2 },
];
const sections = [
  { id: 1, name: "Section 1", project_id: 1 },
  { id: 2, name: "Section 2", project_id: 2 },
];
const statuses = [
  { id: 1, name: "Open" },
  { id: 2, name: "Closed" },
];
const tags = [
  { id: 1, name: "Tag1" },
  { id: 2, name: "Tag2" },
];
const assignees = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

describe("TaskForm AI Suggestion", () => {
  const dummyAuth = { username: "user", password: "pass" };

  beforeEach(() => {
    mock.reset();
    mock.onGet("/api/priorities").reply(200, priorities);
    mock.onGet("/api/portfolios").reply(200, portfolios);
    mock.onGet("/api/projects").reply(200, projects);
    mock.onGet("/api/sections").reply(200, sections);
    mock.onGet("/api/statuses").reply(200, statuses);
    mock.onGet("/api/tags").reply(200, tags);
    mock.onGet("/api/assignees").reply(200, assignees);
  });

  it("shows AI suggestion for priority and allows accepting it", async () => {
    mock.onPost("/api/ai-categorize").reply(200, { priority_id: 2 });
    render(<TaskForm auth={dummyAuth} />);
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "Urgent bug" } });
    await waitFor(() => screen.getByText(/Accept AI suggestion/i));
    fireEvent.click(screen.getByText(/Accept AI suggestion/i));
    const select = screen.getByLabelText(/Priority/i) as HTMLSelectElement;
    expect(select.value).toBe("2");
    expect(select.options[select.selectedIndex].text).toBe("High");
  });

  it("shows AI error if suggestion fails", async () => {
    mock.onPost("/api/ai-categorize").reply(500);
    render(<TaskForm auth={dummyAuth} />);
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "Test AI fail" } });
    await waitFor(() => screen.getByText(/AI suggestion failed/i));
  });
});
