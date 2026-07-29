import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { App } from "../App";
import { NormalizationInspectorPage } from "../pages/NormalizationInspectorPage";

describe("normalization developer fixture inspector", () => {
  it("shows raw and normalized provenance, entity outcomes, event identity, and routing", () => {
    render(
      <MemoryRouter>
        <NormalizationInspectorPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Developer fixture inspector")).toBeInTheDocument();
    expect(screen.getByText("Offline demonstration data")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Raw source record" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Normalized source record" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Entity decisions" })).toBeInTheDocument();
    expect(screen.getByText("rejected")).toBeInTheDocument();
    expect(screen.getAllByText("review required").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Event signature" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Decision trace" })).toBeInTheDocument();
    expect(screen.getByText("normalization-v1")).toBeInTheDocument();
    expect(screen.getByLabelText("Quarantined fixture example")).toBeInTheDocument();
  });

  it("is reachable directly but absent from primary navigation", () => {
    render(
      <MemoryRouter initialEntries={["/dev/normalization"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Normalization decision inspector" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /normalization/i })).not.toBeInTheDocument();
  });
});
