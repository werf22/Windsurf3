import React from "react";
import { render, screen } from "@testing-library/react";
import { Notification } from "../components/Notification";

describe("Notification", () => {
  it("renders success message", () => {
    render(<Notification message="Success!" type="success" />);
    expect(screen.getByText("Success!")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveStyle("background: #d4edda");
  });

  it("renders error message", () => {
    render(<Notification message="Error!" type="error" />);
    expect(screen.getByText("Error!")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveStyle("background: #f8d7da");
  });

  it("renders nothing if message is empty", () => {
    const { container } = render(<Notification message="" />);
    expect(container).toBeEmptyDOMElement();
  });
});
