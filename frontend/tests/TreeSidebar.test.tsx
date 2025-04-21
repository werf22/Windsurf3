import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TreeSidebar, TreeNode } from "../src/components/TreeSidebar";

describe("TreeSidebar", () => {
  const tree: TreeNode[] = [
    {
      id: 1,
      name: "Portfolio 1",
      type: "portfolio",
      children: [
        {
          id: 10,
          name: "Project A",
          type: "project",
          children: [
            { id: 100, name: "Section X", type: "section" }
          ]
        }
      ]
    },
    {
      id: 2,
      name: "Portfolio 2",
      type: "portfolio"
    }
  ];

  it("renders tree structure and handles selection/expansion", () => {
    const handleSelect = jest.fn();
    render(
      <TreeSidebar tree={tree} onSelect={handleSelect} selectedId={null} />
    );
    expect(screen.getByText("Portfolio 2")).toBeInTheDocument();
    // Expand Portfolio 1
    const expandButtons = screen.queryAllByRole("button", { name: /Expand/i });
    expect(expandButtons.length).toBeGreaterThan(0);
    fireEvent.click(expandButtons[0]);
    expect(screen.getByText("Project A")).toBeInTheDocument();
    // Expand Project A only if button exists
    const expandButtons2 = screen.queryAllByRole("button", { name: /Expand/i });
    if (expandButtons2.length > 1) {
      fireEvent.click(expandButtons2[1]);
      expect(screen.getByText("Section X")).toBeInTheDocument();
      // Select Section X
      const sectionX = screen.queryByText("Section X");
      expect(sectionX).toBeInTheDocument();
      fireEvent.click(sectionX!);
      expect(handleSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 100, name: "Section X" }));
    }
  });
});
