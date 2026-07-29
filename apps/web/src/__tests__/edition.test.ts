import { describe, expect, it } from "vitest";
import { currentEdition } from "../lib/edition";
describe("currentEdition", () => {
  it("keeps Closing Edition separate from appearance mode", () => {
    expect(currentEdition(new Date("2026-07-28T22:00:00.000Z"))).toBe("closing");
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });
});
