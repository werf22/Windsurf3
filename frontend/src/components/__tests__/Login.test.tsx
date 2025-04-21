import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Login } from "../Login";

describe("Login component", () => {
  it("renders login form fields and button", () => {
    render(<Login onLogin={jest.fn()} />);
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("calls onLogin with username and password when submitted", () => {
    const onLogin = jest.fn();
    render(<Login onLogin={onLogin} />);
    fireEvent.change(screen.getByPlaceholderText(/Enter your username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
      target: { value: "testpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(onLogin).toHaveBeenCalledWith("testuser", "testpass");
  });

  it("shows error message if error prop is provided", () => {
    render(<Login onLogin={jest.fn()} error="Invalid credentials" />);
    expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
  });

  it("has a link to the registration page", () => {
    render(<Login onLogin={jest.fn()} />);
    const signUpLink = screen.getByText(/Sign up/i);
    expect(signUpLink.closest('a')).toHaveAttribute('href', '/register');
  });
});
