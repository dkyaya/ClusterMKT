import { reconcileIngestion } from "../../packages/core/src/index";
import { loadIngestionFixtures } from "../helpers/ingestion-fixtures";
import { describe, expect, it } from "vitest";

describe("ingestion reconciliation", () => {
  it("keeps all fifty fixture outcomes machine-auditable", () => {
    const fixtures = loadIngestionFixtures();
    expect(fixtures).toHaveLength(50);
    expect(fixtures.map((item) => item.caseNumber)).toEqual(
      Array.from({ length: 50 }, (_, index) => index + 1),
    );
    fixtures.forEach((fixture) => {
      expect(fixture.expectedExplanationCodes.length).toBeGreaterThan(0);
      expect(fixture.expectedReconciliationCounts.received).toBe(
        fixture.expectedReconciliationCounts.accounted,
      );
    });
  });
  it("accepts exactly one state for every raw record", () =>
    expect(
      reconcileIngestion({
        runId: "run-one",
        rawRecordIds: ["raw-a", "raw-b"],
        states: { "raw-a": ["accepted_normalized"], "raw-b": ["quarantined"] },
      }).reconciled,
    ).toBe(true));
  it("reports unexplained loss", () =>
    expect(
      reconcileIngestion({ runId: "run-loss", rawRecordIds: ["raw-a"], states: {} })
        .unexplainedRawRecordIds,
    ).toEqual(["raw-a"]));
  it("reports multiply-accounted records", () =>
    expect(
      reconcileIngestion({
        runId: "run-multiple",
        rawRecordIds: ["raw-a"],
        states: { "raw-a": ["accepted_normalized", "quarantined"] },
      }).multiplyAccountedRawRecordIds,
    ).toEqual(["raw-a"]));
  it("fails reconciliation on a provenance gap", () =>
    expect(
      reconcileIngestion({
        runId: "run-gap",
        rawRecordIds: ["raw-a"],
        states: { "raw-a": ["accepted_normalized"] },
        provenanceFailureIds: ["claim-gap"],
      }).reconciled,
    ).toBe(false));
});
