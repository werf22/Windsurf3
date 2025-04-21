import React, { act } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach } from "@jest/globals";
import Home from "../src/pages/Home";

beforeEach(() => {
  global.fetch = jest.fn((url: string | URL | Request, opts) => {
    let urlStr = typeof url === "string" ? url : url instanceof URL ? url.toString() : url.url || "";
    // Use Response object for proper typing
    if (typeof Response !== "undefined" && urlStr.includes("/api/structure")) {
      return Promise.resolve(new Response(JSON.stringify({
        portfolios: [],
        projects: [],
        sections: [],
        priorities: [],
      }), { status: 200, headers: { "Content-Type": "application/json" } }));
    }
    if (typeof Response !== "undefined") {
      return Promise.resolve(new Response(JSON.stringify({}), { status: 200, headers: { "Content-Type": "application/json" } }));
    }
    // fallback for environments without Response
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as any);
  });
});

describe("Home", () => {
  it("renders the main layout and task list components", async () => {
    // Provide dummy auth for test
    const auth = { username: "test", password: "test" };
    await act(async () => {
      render(<Home auth={auth} />);
    });
    expect(screen.getByText(/AI To Do List/i)).toBeInTheDocument();
    expect(screen.getByText(/Export Tasks as CSV/i)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /AI Chat/i })).toBeInTheDocument();
  });
});
