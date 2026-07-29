import { buildIdempotencyKey, decideIdempotency } from "../../packages/core/src/index";
import { describe, expect, it } from "vitest";

const base = {
  kind: "raw" as const,
  stableInputs: ["source", "article-1", "2026-07-29"],
  proposedRecordId: "raw-1",
  metadataChecksum: "a".repeat(64),
  rulesVersion: "normalization-v1",
};
describe("ingestion idempotency", () => {
  it("builds stable scoped keys", () => {
    expect(buildIdempotencyKey("raw", ["a", "b"])).toHaveLength(64);
    expect(buildIdempotencyKey("raw", ["a", "b"])).toBe(buildIdempotencyKey("raw", ["a", "b"]));
  });
  it("creates a new record", () => expect(decideIdempotency(base).decision).toBe("create"));
  it("skips an exact replay", () =>
    expect(
      decideIdempotency({
        ...base,
        existing: {
          recordId: "raw-existing",
          metadataChecksum: "a".repeat(64),
          rulesVersion: "normalization-v1",
        },
      }).decision,
    ).toBe("skip_exact_duplicate"));
  it("links a corrected version", () =>
    expect(
      decideIdempotency({
        ...base,
        metadataChecksum: "b".repeat(64),
        existing: {
          recordId: "raw-existing",
          metadataChecksum: "a".repeat(64),
          rulesVersion: "normalization-v1",
        },
      }).decision,
    ).toBe("link_version"));
  it("quarantines an unprovable collision", () =>
    expect(
      decideIdempotency({
        ...base,
        metadataChecksum: undefined,
        existing: { recordId: "raw-existing", rulesVersion: "normalization-v1" },
      }).decision,
    ).toBe("quarantine_collision"));
  it("preserves deliberate rules-version reprocessing", () =>
    expect(
      decideIdempotency({
        ...base,
        rulesVersion: "normalization-v2",
        existing: {
          recordId: "raw-existing",
          metadataChecksum: "a".repeat(64),
          rulesVersion: "normalization-v1",
        },
      }).decision,
    ).toBe("update_existing"));
});
