import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { CSVControls } from "../components/CSVControls";

const mock = new MockAdapter(axios);
const dummyAuth = { username: "user", password: "pass" };

describe("CSVControls", () => {
  beforeEach(() => {
    mock.reset();
  });

  it("shows success notification on export", async () => {
    mock.onGet("/api/tasks/export/csv").reply(200, new Blob(["testcsv"]));
    render(<CSVControls auth={dummyAuth} />);
    const exportBtn = screen.getByText(/Export Tasks as CSV/i);
    fireEvent.click(exportBtn);
    await waitFor(() => screen.getByRole("alert"));
    expect(screen.getByRole("alert")).toHaveTextContent(/Export/);
  });

  it("shows error notification on export failure", async () => {
    mock.onGet("/api/tasks/export/csv").reply(500, { detail: "Export error" });
    render(<CSVControls auth={dummyAuth} />);
    const exportBtn = screen.getByText(/Export Tasks as CSV/i);
    fireEvent.click(exportBtn);
    await waitFor(() => screen.getByRole("alert"));
    expect(screen.getByRole("alert")).toHaveTextContent(/Export/);
  });

  it("shows success notification on import", async () => {
    mock.onPost("/api/tasks/import/csv").reply(200);
    render(<CSVControls auth={dummyAuth} onImportComplete={jest.fn()} />);
    const file = new File(["test"], "test.csv", { type: "text/csv" });
    const input = screen.getByTestId("file-input");
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => screen.getByRole("alert"));
    expect(screen.getByRole("alert")).toHaveTextContent(/Import/);
  });

  it("shows error notification on import failure", async () => {
    mock.onPost("/api/tasks/import/csv").reply(500, { detail: "Import error" });
    render(<CSVControls auth={dummyAuth} />);
    const file = new File(["test"], "test.csv", { type: "text/csv" });
    const input = screen.getByTestId("file-input");
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => screen.getByRole("alert"));
    expect(screen.getByRole("alert")).toHaveTextContent(/Import/);
  });
});
