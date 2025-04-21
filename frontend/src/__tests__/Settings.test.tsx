import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Settings from "../pages/Settings";
import { ChakraProvider } from "@chakra-ui/react";

describe("Settings Page", () => {
  it("renders theme and notification switches", () => {
    render(
      <ChakraProvider>
        <Settings />
      </ChakraProvider>
    );
    expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dark Mode/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Enable Notifications/i)).toBeInTheDocument();
  });

  it("toggles notification switch", () => {
    render(
      <ChakraProvider>
        <Settings />
      </ChakraProvider>
    );
    const notifSwitch = screen.getByLabelText(/Enable Notifications/i);
    expect(notifSwitch).toBeChecked();
    fireEvent.click(notifSwitch);
    expect(notifSwitch).not.toBeChecked();
  });
});
