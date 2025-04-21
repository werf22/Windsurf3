import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskFilter } from "../components/TaskFilter";

// Only fields that are rendered as filter controls in the UI should be tested
const FILTERABLE_FIELDS = [
  { field: "task_id", label: "Task ID" },
  { field: "name", label: "Name" },
  { field: "description", label: "Description" },
  { field: "notes", label: "Notes" },
  { field: "task_comments", label: "Task Comments" },
  { field: "portfolio", label: "Portfolio" },
  { field: "project", label: "Project" },
  { field: "sections", label: "Sections" },
  { field: "parent_task", label: "Parent Task" },
  { field: "parent_task_id", label: "Parent Task ID" },
  { field: "tags", label: "Tags" },
  { field: "priority", label: "Priority" },
  { field: "due_date", label: "Due Date" },
  { field: "start_date", label: "Start Date" },
  { field: "created_at", label: "Created At" },
  { field: "completed_at", label: "Completed At" },
  { field: "assignee", label: "Assignee" },
  // Add more if present in the filter UI
];

describe("TaskFilter", () => {
  it("renders a filter control for every filterable field", () => {
    render(<TaskFilter filters={{}} onFiltersChange={() => {}} />);
    FILTERABLE_FIELDS.forEach(({ field, label }) => {
      const exactLabel = `${label} filter (${field})`;
      expect(screen.getByLabelText(exactLabel)).toBeInTheDocument();
    });
  });

  it("handles text input change", () => {
    const onFiltersChange = jest.fn();
    render(<TaskFilter filters={{}} onFiltersChange={onFiltersChange} />);
    const nameInput = screen.getByLabelText("Name filter (name)");
    fireEvent.change(nameInput, { target: { value: "Test" } });
    setTimeout(() => {
      expect(onFiltersChange).toHaveBeenCalled();
    }, 350);
  });

  it("handles date input", () => {
    const onFiltersChange = jest.fn();
    render(<TaskFilter filters={{}} onFiltersChange={onFiltersChange} />);
    const dueDateInput = screen.getByLabelText("Due Date filter (due_date)");
    fireEvent.change(dueDateInput, { target: { value: "2025-04-20" } });
    setTimeout(() => {
      expect(onFiltersChange).toHaveBeenCalled();
    }, 350);
  });

  it("ignores unknown field", () => {
    render(<TaskFilter filters={{ unknown_field: "foo" }} onFiltersChange={() => {}} />);
    expect(screen.getByLabelText("Name filter (name)")).toBeInTheDocument();
  });
});
