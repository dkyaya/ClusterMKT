import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { App } from "../App";
import { IngestionInspectorPage } from "../pages/IngestionInspectorPage";
describe("offline ingestion inspector", () => {
  it("shows provenance, retries, isolation, ledger, reconciliation, and resume", () => {
    render(
      <MemoryRouter>
        <IngestionInspectorPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Developer fixture inspector")).toBeInTheDocument();
    expect(screen.getByText("Offline ingestion simulation")).toBeInTheDocument();
    [
      "Retrieval provenance",
      "Retry timeline and circuit breaker",
      "Quarantine and review isolation",
      "Idempotency decisions and ledger",
      "Checkpoints and resume",
      "Reconciliation",
    ].forEach((name) => expect(screen.getByRole("heading", { name })).toBeInTheDocument());
    expect(screen.getByText("No live sources connected")).toBeInTheDocument();
    expect(screen.getByText("No credentials configured")).toBeInTheDocument();
    expect(screen.getByText("No real network calls")).toBeInTheDocument();
  });
  it("is reachable only by direct route and absent from consumer navigation", () => {
    render(
      <MemoryRouter initialEntries={["/dev/ingestion"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Offline ingestion dry-run inspector" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /ingestion dry-run inspector/iu }),
    ).not.toBeInTheDocument();
  });
});
