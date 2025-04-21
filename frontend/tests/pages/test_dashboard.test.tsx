import React from "react";
import { render, screen } from "@testing-library/react";
import Dashboard from "../../src/pages/Dashboard";
import { ChakraProvider } from "@chakra-ui/react";
import "@testing-library/jest-dom";

describe("Dashboard page", () => {
  it("renders dashboard stats and heading", () => {
    render(
      <ChakraProvider>
        <Dashboard />
      </ChakraProvider>
    );
    expect(screen.getByRole("heading", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByText(/total tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/overdue/i)).toBeInTheDocument();
    expect(screen.getByText(/due today/i)).toBeInTheDocument();
  });

  it("shows placeholder for recent activity", () => {
    render(
      <ChakraProvider>
        <Dashboard />
      </ChakraProvider>
    );
    expect(screen.getByText(/recent activity/i)).toBeInTheDocument();
  });
});
