import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ProfileMenu } from "../components/navigation/ProfileMenu";

function renderMenu(initialEntry = "/") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ProfileMenu />
    </MemoryRouter>,
  );
}

describe("ProfileMenu", () => {
  it("opens an accessible menu with Profile, Settings, and Appearance links", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Open profile menu" }));
    expect(screen.getByRole("menu", { name: "Profile options" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Profile" })).toHaveAttribute("href", "/profile");
    expect(screen.getByRole("menuitem", { name: "Settings" })).toHaveAttribute("href", "/settings");
    expect(screen.getByRole("menuitem", { name: "Appearance" })).toHaveAttribute(
      "href",
      "/settings#appearance",
    );
  });

  it("closes with Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    renderMenu();
    const trigger = screen.getByRole("button", { name: "Open profile menu" });
    await user.click(trigger);
    screen.getByRole("menuitem", { name: "Settings" }).focus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("closes when the user points outside", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole("button", { name: "Open profile menu" }));
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("represents the current Profile route", async () => {
    const user = userEvent.setup();
    renderMenu("/profile");
    await user.click(screen.getByRole("button", { name: "Open profile menu" }));
    expect(screen.getByRole("menuitem", { name: "Profile" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
