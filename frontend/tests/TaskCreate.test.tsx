// @ts-nocheck
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TaskCreate } from "../src/components/TaskCreate";

declare const global: any;
declare const jest: any;

describe("TaskCreate", () => {
  beforeEach(() => {
    global.fetch = jest.fn((url, opts) => {
      if (url.includes("/api/ai-categorize")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            portfolio_id: 1,
            project_id: 2,
            section_id: 3,
            priority_id: 4
          })
        });
      }
      if (url.includes("/api/tasks")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({})
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  it("creates a task with AI suggestions", async () => {
    const mockCreated = jest.fn();
    render(<TaskCreate auth={{ username: "u", password: "p" }} onCreated={mockCreated} />);
    fireEvent.change(screen.getByLabelText(/Task Name/i), { target: { value: "Test Task" } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: "Test Desc" } });
    fireEvent.change(screen.getByLabelText(/Due Date/i), { target: { value: "2025-04-30" } });
    fireEvent.click(screen.getByText(/Suggest with AI/i));
    expect(await screen.findByLabelText(/portfolio id/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/portfolio id/i), { target: { value: "1" } });
    fireEvent.click(screen.getByText(/Create Task/i));
    await waitFor(() => expect(mockCreated).toHaveBeenCalled());
    expect(screen.getByText("Task created!"));
  });

  it("handles AI suggestion failure gracefully", async () => {
    global.fetch = jest.fn((url, opts) => {
      if (url.includes("/api/ai-categorize")) {
        return Promise.resolve({ ok: false });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    render(<TaskCreate auth={{ username: "u", password: "p" }} />);
    fireEvent.change(screen.getByLabelText(/Task Name/i), { target: { value: "Fail Task" } });
    fireEvent.click(screen.getByText(/Suggest with AI/i));
    expect(await screen.findByText(/AI suggestion failed/i)).toBeInTheDocument();
  });
});
