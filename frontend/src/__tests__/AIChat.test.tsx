import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { AIChat } from "../components/AIChat";

const mock = new MockAdapter(axios);
const dummyAuth = { username: "user", password: "pass" };

describe("AIChat global chat integration", () => {
  beforeEach(() => {
    mock.reset();
    mock.onGet("/api/portfolios").reply(200, [{ id: 1, name: "Portfolio1" }]);
    mock.onGet("/api/projects").reply(200, [{ id: 1, name: "Project1" }]);
    mock.onGet("/api/sections").reply(200, [{ id: 1, name: "Section1" }]);
    mock.onGet("/api/priorities").reply(200, [{ id: 1, name: "Low" }, { id: 2, name: "High" }]);
  });

  function getMessageDivs() {
    // Find all divs in the chat log area
    return Array.from(screen.getByRole("log").querySelectorAll("div")).filter(div => div.textContent && div.textContent.trim().length > 0);
  }

  it("renders and sends user/AI messages", async () => {
    mock.onPost("/chat").reply(200, { response: "Hello, user!" });
    render(<AIChat auth={dummyAuth} />);
    expect(screen.getByText(/chat with your ai assistant/i)).toBeInTheDocument();
    const inputs = screen.getAllByLabelText(/message to ai/i);
    const input = inputs[inputs.length - 1];
    fireEvent.change(input, { target: { value: "Hi AI" } });
    fireEvent.click(screen.getByText("Send"));
    await waitFor(() => {
      const divs = getMessageDivs();
      expect(divs.some(div => div.textContent?.replace(/\s+/g, " ").includes("You: Hi AI"))).toBe(true);
      expect(divs.some(div => div.textContent?.replace(/\s+/g, " ").includes("AI: Hello, user!"))).toBe(true);
    });
  });

  it("shows error if AI fails", async () => {
    mock.onPost("/chat").reply(500);
    render(<AIChat auth={dummyAuth} />);
    const inputs = screen.getAllByLabelText(/message to ai/i);
    const input = inputs[inputs.length - 1];
    fireEvent.change(input, { target: { value: "fail" } });
    fireEvent.click(screen.getByText("Send"));
    await waitFor(() => {
      const divs = getMessageDivs();
      expect(divs.some(div => div.textContent?.replace(/\s+/g, " ").includes("AI: [Error contacting AI]"))).toBe(true);
    });
  });
});
