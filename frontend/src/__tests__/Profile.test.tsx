import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Profile from "../pages/Profile";
import { ChakraProvider } from "@chakra-ui/react";

describe("Profile Page", () => {
  it("renders user avatar, username, and email", () => {
    render(
      <ChakraProvider>
        <Profile />
      </ChakraProvider>
    );
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/demo_user/i)).toBeInTheDocument();
    expect(screen.getByText(/demo@example.com/i)).toBeInTheDocument();
  });

  it("can toggle edit mode and update username/email fields", () => {
    render(
      <ChakraProvider>
        <Profile />
      </ChakraProvider>
    );
    const editBtn = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editBtn);
    const usernameInput = screen.getByDisplayValue("demo_user");
    const emailInput = screen.getByDisplayValue("demo@example.com");
    fireEvent.change(usernameInput, { target: { value: "new_user" } });
    fireEvent.change(emailInput, { target: { value: "new@example.com" } });
    expect(usernameInput).toHaveValue("new_user");
    expect(emailInput).toHaveValue("new@example.com");
  });
});
