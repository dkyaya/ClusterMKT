import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DailyBriefPlayer } from "../components/audio/DailyBriefPlayer";
import { dailyBriefStorageKey } from "../lib/dailyBrief";

const morning = new Date("2026-07-28T10:00:00.000Z");

afterEach(() => {
  window.sessionStorage.clear();
  vi.restoreAllMocks();
});

function renderBrief() {
  render(<DailyBriefPlayer edition="morning" now={morning} />);
  const brief = screen.getByLabelText("Morning Brief demonstration audio");
  const closeButton = screen.getByRole("button", { name: "Dismiss Morning Brief" });
  const setPointerCapture = vi.fn();
  const releasePointerCapture = vi.fn();
  Object.defineProperties(brief, {
    getBoundingClientRect: {
      configurable: true,
      value: () => ({
        bottom: 100,
        height: 100,
        left: 0,
        right: 300,
        toJSON: () => ({}),
        top: 0,
        width: 300,
        x: 0,
        y: 0,
      }),
    },
    hasPointerCapture: { configurable: true, value: vi.fn(() => true) },
    releasePointerCapture: { configurable: true, value: releasePointerCapture },
    setPointerCapture: { configurable: true, value: setPointerCapture },
  });
  return { brief, closeButton, releasePointerCapture, setPointerCapture };
}

describe("DailyBriefPlayer", () => {
  it("does not begin a drag when pointerdown starts on the close button", () => {
    const { brief, closeButton, setPointerCapture } = renderBrief();
    fireEvent.pointerDown(closeButton, {
      button: 0,
      clientX: 280,
      clientY: 20,
      pointerId: 1,
      pointerType: "mouse",
    });
    fireEvent.pointerMove(brief, {
      clientX: 100,
      clientY: 20,
      pointerId: 1,
      pointerType: "mouse",
    });
    expect(setPointerCapture).not.toHaveBeenCalled();
    expect(brief).toHaveStyle({ transform: "translateX(0px)" });
  });

  it("does not begin a drag when pointerdown starts inside the close button", () => {
    const { brief, closeButton, setPointerCapture } = renderBrief();
    const closeIcon = closeButton.querySelector("span");
    expect(closeIcon).not.toBeNull();
    fireEvent.pointerDown(closeIcon!, {
      button: 0,
      clientX: 280,
      clientY: 20,
      pointerId: 2,
      pointerType: "mouse",
    });
    fireEvent.pointerMove(brief, {
      clientX: 100,
      clientY: 20,
      pointerId: 2,
      pointerType: "mouse",
    });
    expect(setPointerCapture).not.toHaveBeenCalled();
  });

  it("does not request pointer capture for an interactive descendant", () => {
    const { brief, closeButton, setPointerCapture } = renderBrief();
    fireEvent.pointerDown(closeButton, {
      button: 0,
      pointerId: 3,
      pointerType: "touch",
    });
    fireEvent.pointerMove(brief, {
      clientX: 120,
      pointerId: 3,
      pointerType: "touch",
    });
    expect(setPointerCapture).not.toHaveBeenCalled();
  });

  it("dismisses through a realistic close-button pointer and click sequence", () => {
    const { closeButton, setPointerCapture } = renderBrief();
    fireEvent.pointerDown(closeButton, {
      button: 0,
      pointerId: 4,
      pointerType: "mouse",
    });
    fireEvent.pointerUp(closeButton, { pointerId: 4, pointerType: "mouse" });
    fireEvent.click(closeButton);
    expect(setPointerCapture).not.toHaveBeenCalled();
    expect(screen.queryByLabelText("Morning Brief demonstration audio")).not.toBeInTheDocument();
  });

  it("dismisses through keyboard activation of the close button", async () => {
    const user = userEvent.setup();
    const { closeButton } = renderBrief();
    closeButton.focus();
    await user.keyboard("{Enter}");
    expect(screen.queryByLabelText("Morning Brief demonstration audio")).not.toBeInTheDocument();
  });

  it("begins a horizontal drag from a non-interactive card area", () => {
    const { brief, setPointerCapture } = renderBrief();
    fireEvent.pointerDown(brief, {
      button: 0,
      clientX: 0,
      clientY: 0,
      pointerId: 5,
      pointerType: "mouse",
    });
    fireEvent.pointerMove(brief, {
      clientX: 40,
      clientY: 2,
      pointerId: 5,
      pointerType: "mouse",
    });
    expect(setPointerCapture).toHaveBeenCalledWith(5);
    expect(brief).toHaveStyle({ transform: "translateX(40px)" });
  });

  it("dismisses after a horizontal pointer drag crosses the threshold", () => {
    const { brief, releasePointerCapture, setPointerCapture } = renderBrief();
    fireEvent.pointerDown(brief, {
      button: 0,
      clientX: 0,
      clientY: 0,
      pointerId: 6,
      pointerType: "mouse",
    });
    fireEvent.pointerMove(brief, {
      clientX: 100,
      clientY: 2,
      pointerId: 6,
      pointerType: "mouse",
    });
    fireEvent.pointerUp(brief, {
      clientX: 100,
      clientY: 2,
      pointerId: 6,
      pointerType: "mouse",
    });
    expect(setPointerCapture).toHaveBeenCalledWith(6);
    expect(releasePointerCapture).toHaveBeenCalledWith(6);
    expect(screen.queryByLabelText("Morning Brief demonstration audio")).not.toBeInTheDocument();
  });

  it("returns to rest when a horizontal drag misses the threshold", () => {
    const { brief, releasePointerCapture } = renderBrief();
    fireEvent.pointerDown(brief, {
      button: 0,
      clientX: 0,
      clientY: 0,
      pointerId: 7,
      pointerType: "touch",
    });
    fireEvent.pointerMove(brief, {
      clientX: 40,
      clientY: 2,
      pointerId: 7,
      pointerType: "touch",
    });
    fireEvent.pointerUp(brief, {
      clientX: 40,
      clientY: 2,
      pointerId: 7,
      pointerType: "touch",
    });
    expect(releasePointerCapture).toHaveBeenCalledWith(7);
    expect(brief).toHaveStyle({ transform: "translateX(0px)" });
  });

  it("does not dismiss or capture the pointer for vertical movement", () => {
    const { brief, setPointerCapture } = renderBrief();
    fireEvent.pointerDown(brief, {
      button: 0,
      clientX: 0,
      clientY: 0,
      pointerId: 8,
      pointerType: "touch",
    });
    fireEvent.pointerMove(brief, {
      clientX: 20,
      clientY: 100,
      pointerId: 8,
      pointerType: "touch",
    });
    fireEvent.pointerUp(brief, {
      clientX: 120,
      clientY: 200,
      pointerId: 8,
      pointerType: "touch",
    });
    expect(setPointerCapture).not.toHaveBeenCalled();
    expect(brief).toHaveStyle({ transform: "translateX(0px)" });
    expect(brief).toBeInTheDocument();
  });

  it("resets safely when the active pointer is cancelled", () => {
    const { brief, releasePointerCapture } = renderBrief();
    fireEvent.pointerDown(brief, {
      button: 0,
      clientX: 0,
      clientY: 0,
      pointerId: 9,
      pointerType: "touch",
    });
    fireEvent.pointerMove(brief, {
      clientX: 40,
      clientY: 2,
      pointerId: 9,
      pointerType: "touch",
    });
    expect(brief).toHaveStyle({ transform: "translateX(40px)" });
    fireEvent.pointerCancel(brief, { pointerId: 9, pointerType: "touch" });
    expect(releasePointerCapture).toHaveBeenCalledWith(9);
    expect(brief).toHaveStyle({ transform: "translateX(0px)" });
  });

  it("honors data-no-drag as an explicit opt-out contract", () => {
    const { brief, setPointerCapture } = renderBrief();
    const actions = brief.querySelector<HTMLElement>("[data-no-drag]");
    expect(actions).not.toBeNull();
    fireEvent.pointerDown(actions!, {
      button: 0,
      clientX: 250,
      clientY: 20,
      pointerId: 10,
      pointerType: "mouse",
    });
    fireEvent.pointerMove(brief, {
      clientX: 100,
      clientY: 20,
      pointerId: 10,
      pointerType: "mouse",
    });
    expect(setPointerCapture).not.toHaveBeenCalled();
  });

  it("persists dismissal only for the matching market date and edition", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<DailyBriefPlayer edition="morning" now={morning} />);
    await user.click(screen.getByRole("button", { name: "Dismiss Morning Brief" }));
    const morningKey = dailyBriefStorageKey(morning, "morning");
    expect(morningKey).toBe("cluster-mkt:daily-brief-dismissed:2026-07-28:morning");
    expect(window.sessionStorage.getItem(morningKey)).toBe("true");
    unmount();

    const nextDate = new Date("2026-07-29T10:00:00.000Z");
    const { rerender } = render(<DailyBriefPlayer edition="morning" now={morning} />);
    expect(screen.queryByLabelText("Morning Brief demonstration audio")).not.toBeInTheDocument();
    rerender(<DailyBriefPlayer edition="midday" now={morning} />);
    expect(screen.getByLabelText("Midday Brief demonstration audio")).toBeInTheDocument();
    rerender(<DailyBriefPlayer edition="morning" now={nextDate} />);
    expect(screen.getByLabelText("Morning Brief demonstration audio")).toBeInTheDocument();
  });

  it("remains usable when session storage fails", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    const user = userEvent.setup();
    render(<DailyBriefPlayer edition="morning" now={morning} />);
    await user.click(screen.getByRole("button", { name: "Dismiss Morning Brief" }));
    expect(screen.queryByLabelText("Morning Brief demonstration audio")).not.toBeInTheDocument();
  });

  it("dismisses with Escape when focus is within the brief", async () => {
    const user = userEvent.setup();
    render(<DailyBriefPlayer edition="morning" now={morning} />);
    screen.getByRole("button", { name: "Dismiss Morning Brief" }).focus();
    await user.keyboard("{Escape}");
    expect(screen.queryByLabelText("Morning Brief demonstration audio")).not.toBeInTheDocument();
  });
});
