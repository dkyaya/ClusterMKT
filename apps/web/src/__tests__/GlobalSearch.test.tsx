import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { GlobalSearch } from "../components/search/GlobalSearch";

describe("GlobalSearch", () => {
  it("accepts typing and clears through its visible control", async () => {
    const user = userEvent.setup();
    render(<GlobalSearch />);
    const input = screen.getByRole("searchbox", { name: "Search stories, companies, or themes" });
    await user.type(input, "grid capacity");
    expect(input).toHaveValue("grid capacity");
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(input).toHaveValue("");
  });

  it("clears the query with Escape while focused", async () => {
    const user = userEvent.setup();
    render(<GlobalSearch />);
    const input = screen.getByRole("searchbox", { name: "Search stories, companies, or themes" });
    await user.type(input, "supply{Escape}");
    expect(input).toHaveValue("");
  });

  it("reports honestly that indexing is disconnected on submission", async () => {
    const user = userEvent.setup();
    render(<GlobalSearch />);
    const input = screen.getByRole("searchbox", { name: "Search stories, companies, or themes" });
    await user.type(input, "infrastructure{Enter}");
    expect(screen.getByRole("status")).toHaveTextContent("Search indexing is not connected yet");
    expect(screen.getByRole("status")).toHaveTextContent("No search was performed");
    expect(screen.queryByText(/search results/i)).not.toBeInTheDocument();
  });

  it("treats an empty submission as a quiet no-op", async () => {
    const user = userEvent.setup();
    render(<GlobalSearch />);
    await user.click(
      screen.getByRole("searchbox", { name: "Search stories, companies, or themes" }),
    );
    await user.keyboard("{Enter}");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
