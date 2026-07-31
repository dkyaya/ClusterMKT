import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { App } from "../App";
import { ReviewerItemPage } from "../pages/ReviewerItemPage";

describe("gold corpus reviewer workflow", () => {
  it("shows coverage honestly without fabricated human outcomes", () => {
    render(
      <MemoryRouter initialEntries={["/dev/review"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Blinded gold-corpus review" })).toBeInTheDocument();
    expect(screen.getByText("345 items")).toBeInTheDocument();
    expect(screen.getAllByText("Not measurable", { selector: "dd" })).toHaveLength(2);
    expect(screen.getByText(/0 automated labels/iu)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /reviewer workbench/iu })).not.toBeInTheDocument();
  });

  it("keeps predictions and peer decisions hidden before and after local submission", () => {
    render(
      <MemoryRouter initialEntries={["/dev/review/gold-item-0001"]}>
        <ReviewerItemPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Review without predictions" })).toBeInTheDocument();
    expect(
      screen.getByText(/pipeline predictions and peer labels remain hidden/iu),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Insufficient evidence in this package")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Exact duplicate"));
    fireEvent.click(screen.getByRole("button", { name: "Submit independent decision" }));
    expect(screen.getByRole("status")).toHaveTextContent(/not a gold label/iu);
    expect(screen.queryByText(/system candidate/iu)).not.toBeInTheDocument();
  });

  it("blocks adjudication until independent decisions exist", () => {
    render(
      <MemoryRouter initialEntries={["/dev/adjudication"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Adjudication requires independent evidence review" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Blocked safely")).toBeInTheDocument();
    expect(screen.getByText(/at least two independent reviewer submissions/iu)).toBeInTheDocument();
  });
});
