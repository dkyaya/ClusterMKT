import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { App } from "../App";
import { ClusterInspectorPage } from "../pages/ClusterInspectorPage";

describe("Story Cluster developer fixture inspector", () => {
  it("shows membership, claims, discourse, uncertainty, routing, and provenance", () => {
    render(
      <MemoryRouter>
        <ClusterInspectorPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Developer fixture inspector")).toBeInTheDocument();
    expect(screen.getByText("Offline demonstration data")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Cluster membership" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Claims and evidence" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Agreement group" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Disagreement group" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What remains uncertain" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Review routing" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Provenance paths" })).toBeInTheDocument();
    expect(screen.getByText("normalization-v1")).toBeInTheDocument();
    expect(screen.getByText("review required")).toBeInTheDocument();
    expect(screen.getByText("quarantined")).toBeInTheDocument();
    expect(screen.getByText("Eligible for display:", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Eligible for Sector Brief:", { exact: false })).toBeInTheDocument();
  });

  it("is direct-URL-only and absent from consumer navigation", () => {
    render(
      <MemoryRouter initialEntries={["/dev/clusters"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Story Cluster and claim provenance inspector" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /claim provenance inspector/iu }),
    ).not.toBeInTheDocument();
  });
});
