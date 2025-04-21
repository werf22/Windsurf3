import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Register } from "../Register";

// Mock fetch for registration API
beforeEach(() => {
  global.fetch = jest.fn();
});
afterEach(() => {
  jest.resetAllMocks();
});

describe("Register component", () => {
  it("renders all fields and submits valid registration", async () => {
    const onRegister = jest.fn();
    render(<Register onRegister={onRegister} error={undefined} />);

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "testuser" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => expect(onRegister).toHaveBeenCalledWith("testuser", "test@example.com", "password123"));
  });

  it("shows error for password mismatch", async () => {
    render(<Register onRegister={jest.fn()} error={undefined} />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "testuser" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: "wrongpass" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  it("shows error for invalid email", async () => {
    render(<Register onRegister={jest.fn()} error={undefined} />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "testuser" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "invalidemail" } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await waitFor(() => expect(screen.getByText((content) => content.includes("Invalid email address"))).toBeInTheDocument());
  });

  it("shows error from backend", async () => {
    render(<Register onRegister={jest.fn()} error="Username or email already registered" />);
    expect(screen.getByText(/Username or email already registered/i)).toBeInTheDocument();
  });
});
