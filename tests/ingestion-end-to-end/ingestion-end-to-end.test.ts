import { runOfflineIngestion } from "../../pipelines/ingestion/src/index";
import { describe, expect, it } from "vitest";

describe("offline end-to-end ingestion simulation", () => {
  it.each(["morning", "midday", "closing"] as const)(
    "builds one accepted Sector Brief for %s",
    (edition) => {
      const output = runOfflineIngestion({ marketDate: "2026-07-29", edition });
      expect(output.briefs).toHaveLength(1);
      expect(output.reconciliation.reconciled).toBe(true);
    },
  );
  it("is stable across exact replay", () => {
    const first = runOfflineIngestion({ marketDate: "2026-07-29", edition: "morning" });
    const second = runOfflineIngestion({ marketDate: "2026-07-29", edition: "morning" });
    expect(second.runId).toBe(first.runId);
    expect(second.briefs).toEqual(first.briefs);
  });
  it("isolates review, rejected, and quarantine outcomes", () => {
    const output = runOfflineIngestion({ marketDate: "2026-07-29", edition: "midday" });
    expect(output.clusters.accepted).toHaveLength(1);
    expect(output.clusters.reviewRequired).toHaveLength(1);
    expect(output.clusters.rejected).toHaveLength(1);
    expect(output.reconciliation.rawRecordStates["raw-malformed-url"]).toBe("quarantined");
  });
  it("reports no live network or credentials", () => {
    const output = runOfflineIngestion({ marketDate: "2026-07-29", edition: "closing" });
    expect(output.report).toMatchObject({
      liveNetworkCalls: 0,
      credentialsConfigured: false,
      mode: "offline-fixture-only",
    });
  });
  it("selects only explicitly enabled fixture sources", () => {
    const output = runOfflineIngestion({ marketDate: "2026-07-29", edition: "morning" });
    expect(
      output.sources.every(
        (source) => source.fixtureRetrievalEnabled && source.liveEligibility === "fixture_only",
      ),
    ).toBe(true);
  });
  it("accounts for every raw record", () => {
    const output = runOfflineIngestion({ marketDate: "2026-07-29", edition: "morning" });
    expect(Object.keys(output.reconciliation.rawRecordStates)).toHaveLength(output.rawIds.length);
    expect(output.reconciliation.unexplainedRawRecordIds).toHaveLength(0);
  });
});
