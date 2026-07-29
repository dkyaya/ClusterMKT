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

describe("DailyBriefPlayer", () => {
  it("dismisses through its accessible edition-specific close button", async () => {
    const user = userEvent.setup();
    render(<DailyBriefPlayer edition="morning" now={morning} />);
    await user.click(screen.getByRole("button", { name: "Dismiss Morning Brief" }));
    expect(screen.queryByLabelText("Morning Brief demonstration audio")).not.toBeInTheDocument();
  });

  it("persists dismissal for the market date and edition", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<DailyBriefPlayer edition="morning" now={morning} />);
    await user.click(screen.getByRole("button", { name: "Dismiss Morning Brief" }));
    expect(window.sessionStorage.getItem(dailyBriefStorageKey(morning, "morning"))).toBe("true");
    unmount();
    render(<DailyBriefPlayer edition="morning" now={morning} />);
    expect(screen.queryByLabelText("Morning Brief demonstration audio")).not.toBeInTheDocument();
  });

  it("uses distinct keys for editions and market dates", () => {
    const nextDate = new Date("2026-07-29T10:00:00.000Z");
    expect(dailyBriefStorageKey(morning, "morning")).toBe(
      "cluster-mkt:daily-brief-dismissed:2026-07-28:morning",
    );
    expect(dailyBriefStorageKey(morning, "midday")).not.toBe(
      dailyBriefStorageKey(morning, "morning"),
    );
    expect(dailyBriefStorageKey(nextDate, "morning")).not.toBe(
      dailyBriefStorageKey(morning, "morning"),
    );
  });

  it("allows a different edition or market date to appear after Morning is dismissed", () => {
    window.sessionStorage.setItem(dailyBriefStorageKey(morning, "morning"), "true");
    const { rerender } = render(<DailyBriefPlayer edition="morning" now={morning} />);
    expect(screen.queryByLabelText("Morning Brief demonstration audio")).not.toBeInTheDocument();
    rerender(<DailyBriefPlayer edition="midday" now={morning} />);
    expect(screen.getByLabelText("Midday Brief demonstration audio")).toBeInTheDocument();
    rerender(<DailyBriefPlayer edition="morning" now={new Date("2026-07-29T10:00:00.000Z")} />);
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

  it("dismisses after a horizontal pointer drag crosses the threshold", () => {
    render(<DailyBriefPlayer edition="morning" now={morning} />);
    const brief = screen.getByLabelText("Morning Brief demonstration audio");
    vi.spyOn(brief, "getBoundingClientRect").mockReturnValue({
      bottom: 100,
      height: 100,
      left: 0,
      right: 300,
      toJSON: () => ({}),
      top: 0,
      width: 300,
      x: 0,
      y: 0,
    });
    fireEvent.pointerDown(brief, {
      button: 0,
      clientX: 0,
      clientY: 0,
      pointerId: 1,
      pointerType: "mouse",
    });
    fireEvent.pointerMove(brief, { clientX: 100, clientY: 2, pointerId: 1, pointerType: "mouse" });
    fireEvent.pointerUp(brief, { clientX: 100, clientY: 2, pointerId: 1, pointerType: "mouse" });
    expect(screen.queryByLabelText("Morning Brief demonstration audio")).not.toBeInTheDocument();
  });

  it("returns to rest when a horizontal drag misses the threshold", () => {
    render(<DailyBriefPlayer edition="morning" now={morning} />);
    const brief = screen.getByLabelText("Morning Brief demonstration audio");
    vi.spyOn(brief, "getBoundingClientRect").mockReturnValue({
      bottom: 100,
      height: 100,
      left: 0,
      right: 300,
      toJSON: () => ({}),
      top: 0,
      width: 300,
      x: 0,
      y: 0,
    });
    fireEvent.pointerDown(brief, {
      button: 0,
      clientX: 0,
      clientY: 0,
      pointerId: 2,
      pointerType: "touch",
    });
    fireEvent.pointerMove(brief, { clientX: 40, clientY: 2, pointerId: 2, pointerType: "touch" });
    fireEvent.pointerUp(brief, { clientX: 40, clientY: 2, pointerId: 2, pointerType: "touch" });
    expect(brief).toHaveStyle({ transform: "translateX(0px)" });
  });

  it("dismisses with Escape when focus is within the brief", async () => {
    const user = userEvent.setup();
    render(<DailyBriefPlayer edition="morning" now={morning} />);
    screen.getByRole("button", { name: "Dismiss Morning Brief" }).focus();
    await user.keyboard("{Escape}");
    expect(screen.queryByLabelText("Morning Brief demonstration audio")).not.toBeInTheDocument();
  });
});
