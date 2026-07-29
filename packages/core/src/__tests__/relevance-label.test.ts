import { describe, expect, it } from "vitest";
import { relevanceLabelForScore } from "../lib/relevance-label";

describe("relevanceLabelForScore", () => {
  it.each([
    [0.9, "high"],
    [0.75, "high"],
    [0.5, "moderate"],
    [0.2, "context"],
  ] as const)("maps %s deterministically", (score, expected) => {
    expect(relevanceLabelForScore(score)).toBe(expected);
  });

  it("rejects scores outside the validated range", () => {
    expect(() => relevanceLabelForScore(1.1)).toThrow(RangeError);
  });
});
