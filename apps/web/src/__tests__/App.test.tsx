import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { App } from "../App";
describe("App", () => {
  it("renders navigation, demonstration labeling, and cluster tabs", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
    expect(screen.getAllByText("Demonstration data").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Overview" }).length).toBeGreaterThan(0);
  });
});
