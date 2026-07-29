import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Tabs } from "../components/Tabs";

const items = [
  { id: "overview", label: "Overview", panel: "Overview content" },
  { id: "read", label: "Read", panel: "Read content" },
];

describe("UI primitives", () => {
  it("exposes accessible tabs and changes panel by click", async () => {
    const user = userEvent.setup();
    render(<Tabs items={items} label="Cluster sections" />);
    expect(screen.getByRole("tablist", { name: "Cluster sections" })).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Read" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Read content");
  });

  it("supports arrow-key navigation", async () => {
    const user = userEvent.setup();
    render(<Tabs items={items} label="Cluster sections" />);
    const overview = screen.getByRole("tab", { name: "Overview" });
    overview.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Read" })).toHaveAttribute("aria-selected", "true");
  });

  it("renders button and badge labels", () => {
    render(
      <>
        <Button>Continue</Button>
        <Badge>High relevance</Badge>
      </>,
    );
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
    expect(screen.getByText("High relevance")).toBeInTheDocument();
  });
});
