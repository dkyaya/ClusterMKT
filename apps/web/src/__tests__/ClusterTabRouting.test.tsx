import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ClusterDetailPage } from "../pages/ClusterDetailPage";

function createClusterRouter(initialEntry: string) {
  return createMemoryRouter([{ path: "/clusters/:clusterId", element: <ClusterDetailPage /> }], {
    initialEntries: [initialEntry],
  });
}

describe("Story Cluster tab routing", () => {
  it("opens Read directly from the URL", () => {
    const router = createClusterRouter("/clusters/cluster-grid-review?tab=read");
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("tab", { name: "Read (2)" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Demonstration Issuer IR")).toBeVisible();
  });

  it("opens Listen directly with cluster-specific audio and no global Daily Brief copy", () => {
    const router = createClusterRouter("/clusters/cluster-grid-review?tab=listen");
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("tab", { name: "Listen (1)" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByLabelText(
        "Cluster audio brief for Infrastructure review moves into its next public phase",
      ),
    ).toHaveAttribute("data-cluster-id", "cluster-grid-review");
    expect(screen.queryByText("Daily market brief")).not.toBeInTheDocument();
  });

  it.each(["/clusters/cluster-grid-review", "/clusters/cluster-grid-review?tab=unsupported"])(
    "falls back to Overview for %s",
    (entry) => {
      const router = createClusterRouter(entry);
      render(<RouterProvider router={router} />);
      expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    },
  );

  it("updates the query parameter when a tab is selected", async () => {
    const user = userEvent.setup();
    const router = createClusterRouter("/clusters/cluster-grid-review?tab=overview");
    render(<RouterProvider router={router} />);
    await user.click(screen.getByRole("tab", { name: "Read (2)" }));
    expect(router.state.location.search).toBe("?tab=read");
    expect(screen.getByRole("tab", { name: "Read (2)" })).toHaveAttribute("aria-selected", "true");
  });

  it("restores tab state through browser-style history navigation", async () => {
    const user = userEvent.setup();
    const router = createClusterRouter("/clusters/cluster-grid-review?tab=overview");
    render(<RouterProvider router={router} />);
    await user.click(screen.getByRole("tab", { name: "Read (2)" }));
    await user.click(screen.getByRole("tab", { name: "Listen (1)" }));
    await act(() => router.navigate(-1));
    expect(router.state.location.search).toBe("?tab=read");
    expect(screen.getByRole("tab", { name: "Read (2)" })).toHaveAttribute("aria-selected", "true");
  });
});
