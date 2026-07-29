/// <reference types="node" />

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCollapsibleSearchHeader } from "../hooks/useCollapsibleSearchHeader";

function installMatchMedia(mobile: boolean) {
  const addEventListener = vi.fn();
  const removeEventListener = vi.fn();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => ({
      addEventListener,
      dispatchEvent: () => false,
      matches: mobile,
      media: "(max-width: 800px)",
      onchange: null,
      removeEventListener,
    })),
  });
  return { addEventListener, removeEventListener };
}

function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", { configurable: true, value: y });
  window.dispatchEvent(new Event("scroll"));
}

afterEach(() => scrollTo(0));

describe("useCollapsibleSearchHeader", () => {
  it("is visible at the top and hides after meaningful downward scrolling", () => {
    installMatchMedia(true);
    const { result } = renderHook(() =>
      useCollapsibleSearchHeader({ profileMenuOpen: false, searchFocused: false }),
    );
    expect(result.current).toBe(true);
    act(() => scrollTo(30));
    expect(result.current).toBe(false);
  });

  it("restores after the upward threshold", () => {
    installMatchMedia(true);
    const { result } = renderHook(() =>
      useCollapsibleSearchHeader({ profileMenuOpen: false, searchFocused: false }),
    );
    act(() => scrollTo(40));
    expect(result.current).toBe(false);
    act(() => scrollTo(28));
    expect(result.current).toBe(true);
  });

  it("ignores tiny directional changes until thresholds accumulate", () => {
    installMatchMedia(true);
    const { result } = renderHook(() =>
      useCollapsibleSearchHeader({ profileMenuOpen: false, searchFocused: false }),
    );
    act(() => scrollTo(10));
    act(() => scrollTo(20));
    expect(result.current).toBe(true);
    act(() => scrollTo(25));
    expect(result.current).toBe(true);
    act(() => scrollTo(35));
    expect(result.current).toBe(false);
  });

  it("remains visible while search is focused or the profile menu is open", () => {
    installMatchMedia(true);
    const { result, rerender } = renderHook(
      ({ focused, menuOpen }) =>
        useCollapsibleSearchHeader({ profileMenuOpen: menuOpen, searchFocused: focused }),
      { initialProps: { focused: false, menuOpen: false } },
    );
    act(() => scrollTo(40));
    expect(result.current).toBe(false);
    rerender({ focused: true, menuOpen: false });
    expect(result.current).toBe(true);
    rerender({ focused: false, menuOpen: true });
    expect(result.current).toBe(true);
  });

  it("never collapses on desktop", () => {
    installMatchMedia(false);
    const { result } = renderHook(() =>
      useCollapsibleSearchHeader({ profileMenuOpen: false, searchFocused: false }),
    );
    act(() => scrollTo(200));
    expect(result.current).toBe(true);
  });

  it("cleans up scroll and media-query listeners", () => {
    const media = installMatchMedia(true);
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() =>
      useCollapsibleSearchHeader({ profileMenuOpen: false, searchFocused: false }),
    );
    unmount();
    expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function));
    expect(media.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("removes header and dismissal motion under reduced-motion preferences", () => {
    const layoutCss = readFileSync(resolve("apps/web/src/styles/layout.css"), "utf8");
    expect(layoutCss).toContain("@media (prefers-reduced-motion: reduce)");
    expect(layoutCss).toMatch(
      /\.header-search-row,\s*\.daily-brief-player\s*{\s*transition: none;/,
    );
  });
});
