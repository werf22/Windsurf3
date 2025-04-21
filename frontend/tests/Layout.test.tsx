import React from "react";
import { render, screen } from "@testing-library/react";
import { Layout } from "../src/components/Layout";

describe("Layout", () => {
  it("renders sidebar and children", () => {
    render(
      <Layout sidebar={<div data-testid="sidebar">Sidebar</div>}>
        <div data-testid="main-content">Main Content</div>
      </Layout>
    );
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("main-content")).toBeInTheDocument();
  });
});
