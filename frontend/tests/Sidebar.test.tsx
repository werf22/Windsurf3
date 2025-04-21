import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Sidebar } from "../src/components/Sidebar";

describe("Sidebar", () => {
  it("renders items and handles clicks", () => {
    const items = [
      { id: 1, name: "Portfolio 1", onClick: jest.fn() },
      { id: 2, name: "Portfolio 2", onClick: jest.fn() },
    ];
    render(<Sidebar items={items} title="Portfolios" />);
    expect(screen.getByText("Portfolio 1")).toBeInTheDocument();
    expect(screen.getByText("Portfolio 2")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Portfolio 2"));
    expect(items[1].onClick).toHaveBeenCalled();
  });
});
