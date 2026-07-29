import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { SectorDetailPage } from "../pages/SectorDetailPage";
import { SectorsPage } from "../pages/SectorsPage";

describe("sector demonstration experience", () => {
  it("lists the followed Semiconductors sector without implying live coverage", () => {
    render(
      <MemoryRouter>
        <SectorsPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Sectors" })).toBeInTheDocument();
    expect(screen.getByText("Demonstration data")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View sector coverage" })).toHaveAttribute(
      "href",
      "/sectors/semiconductors",
    );
  });

  it("makes every cluster scope distinction and assembly rule visible", () => {
    render(
      <MemoryRouter initialEntries={["/sectors/semiconductors"]}>
        <Routes>
          <Route path="/sectors/:sectorId" element={<SectorDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Semiconductors" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Semiconductors Sector Brief" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Sector-wide").length).toBeGreaterThan(0);
    expect(screen.getByText("Company-led impact")).toBeInTheDocument();
    expect(screen.getByText("Macro-to-sector")).toBeInTheDocument();
    expect(screen.getByText("Company-specific")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "What the fixtures do not establish" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Open related Story Cluster" })).toHaveLength(5);
  });
});
