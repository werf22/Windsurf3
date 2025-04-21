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
  { id: 10, name: "Main Portfolio" },
  { id: 11, name: "Side Portfolio" },
];
const projects = [
  { id: 20, name: "Alpha Project" },
  { id: 21, name: "Beta Project" },
];
const sections = [
  { id: 30, name: "Backlog" },
  { id: 31, name: "Sprint" },
];

describe("TaskForm AI Suggestions for Portfolio, Project, Section, Tags", () => {
  const dummyAuth = { username: "user", password: "pass" };

  beforeEach(() => {
    mock.reset();
    mock.onGet("/api/priorities").reply(200, priorities);
    mock.onGet("/api/portfolios").reply(200, portfolios);
    mock.onGet("/api/projects").reply(200, projects);
    mock.onGet("/api/sections").reply(200, sections);
  });

  it("shows and accepts AI suggestions for all extra fields", async () => {
    mock.onPost("/api/ai-categorize").reply(200, {
      priority_id: 2,
      portfolio_id: 10,
      project_id: 21,
      section_id: 31,
      tags: "urgent,frontend"
    });
    render(<TaskForm auth={dummyAuth} />);
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "Implement urgent frontend" } });
    // Wait for all 5 Accept AI suggestion buttons to appear
    await waitFor(() => {
      const btns = screen.getAllByText(/Accept AI suggestion/i);
      expect(btns.length).toBeGreaterThanOrEqual(5);
    });
    // Accept all suggestions
    const btns = screen.getAllByText(/Accept AI suggestion/i);
    btns.forEach(btn => fireEvent.click(btn));
    // Check values
    expect((screen.getByLabelText(/Priority/i) as HTMLSelectElement).value).toBe("2");
    expect((screen.getByLabelText(/Portfolio/i) as HTMLSelectElement).value).toBe("10");
    expect((screen.getByLabelText(/Project/i) as HTMLSelectElement).value).toBe("21");
    expect((screen.getByLabelText(/Section/i) as HTMLSelectElement).value).toBe("31");
    expect((screen.getByLabelText(/Tags/i) as HTMLInputElement).value).toBe("urgent,frontend");
  });

  it("shows AI error for extra fields if suggestion fails", async () => {
    mock.onPost("/api/ai-categorize").reply(500);
    render(<TaskForm auth={dummyAuth} />);
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "Test AI fail" } });
    await waitFor(() => screen.getByText(/AI suggestion failed/i));
  });
});
