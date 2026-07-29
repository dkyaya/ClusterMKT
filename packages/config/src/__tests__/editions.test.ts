import { describe, expect, it } from "vitest";
import { EDITIONS, editionForDate } from "../editions";

describe("market editions", () => {
  it("defines each edition exactly once", () => {
    expect(EDITIONS.map(({ id }) => id)).toEqual(["morning", "midday", "closing"]);
  });

  it.each([
    ["2026-07-28T09:59:00.000Z", "closing"],
    ["2026-07-28T10:00:00.000Z", "morning"],
    ["2026-07-28T15:59:00.000Z", "morning"],
    ["2026-07-28T16:00:00.000Z", "midday"],
    ["2026-07-28T21:59:00.000Z", "midday"],
    ["2026-07-28T22:00:00.000Z", "closing"],
    ["2026-07-28T08:00:00.000Z", "closing"],
  ] as const)("maps %s to %s in America/New_York", (timestamp, expected) => {
    expect(editionForDate(new Date(timestamp))).toBe(expected);
  });
});
