import { executeFixtureAdapter } from "../../packages/core/src/index";
import {
  mockFailureAdapter,
  mockFilingAdapter,
  mockPodcastAdapter,
  mockRssAdapter,
  mockTranscriptAdapter,
} from "../../pipelines/ingestion/src/index";
import { describe, expect, it } from "vitest";

const input = {
  ingestionRunId: "run-adapter-test",
  cursor: null,
  checkpoint: null,
  requestedWindow: { from: "2026-07-29T00:00:00.000Z", to: "2026-07-30T00:00:00.000Z" },
  maximumItemCount: 10,
  dryRun: true as const,
  retrievalTimestamp: "2026-07-29T12:07:00.000Z",
  fixtureId: "adapter-contract",
};
describe("fixture adapter contracts", () => {
  it.each([mockRssAdapter, mockFilingAdapter, mockPodcastAdapter, mockTranscriptAdapter])(
    "returns raw records through the shared contract",
    async (adapter) => {
      const result = await executeFixtureAdapter(adapter, input);
      expect(result.resultRecords).toHaveLength(1);
      expect(result.retrievalProvenanceId).toBeTruthy();
    },
  );
  it("reports errors explicitly rather than throwing away the attempt", async () => {
    const result = await executeFixtureAdapter(mockFailureAdapter, input);
    expect(result.errors[0]).toMatchObject({ errorClass: "rate_limited", retryable: true });
    expect(result.retryAfterSeconds).toBe(30);
  });
  it("refuses non-dry-run inputs", async () => {
    await expect(
      executeFixtureAdapter(mockRssAdapter, { ...input, dryRun: false }),
    ).rejects.toThrow();
  });
});
