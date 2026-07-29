import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { StoryClusterCard } from "../components/story/StoryClusterCard";
import { demoClusters } from "../data/demoClusters";
describe("StoryClusterCard", () => {
  it("renders evidence context and cluster access", () => {
    const cluster = demoClusters[0];
    if (!cluster) throw new Error("Fixture missing");
    render(
      <MemoryRouter>
        <StoryClusterCard cluster={cluster} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Why it matters:/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Overview" })).toBeInTheDocument();
  });
});
