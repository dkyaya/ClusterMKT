import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildEventSignature,
  decideEventBoundary,
  type EventSignatureInput,
} from "../../packages/core/src/index";
import { NORMALIZATION_RULES_VERSION } from "../../packages/config/src/index";

interface EventCorpusCase {
  id: string;
  inputRecords: unknown[];
  expectedNormalizedResult: Record<string, unknown>;
  expectedEntityDecisions: unknown[];
  expectedDuplicateOrVersionRelationship: string;
  expectedEventRelationship: string;
  expectedReviewStatus: string;
  expectedExplanationCodes: string[];
}

const corpus = JSON.parse(
  readFileSync(
    resolve(process.cwd(), "tests/fixtures/event-boundaries/event-boundary-cases.json"),
    "utf8",
  ),
) as EventCorpusCase[];

const base: EventSignatureInput = {
  id: "event-a",
  eventType: "earnings",
  primaryEntityIds: ["company-nvidia"],
  action: "reports quarterly earnings",
  announcementDate: "2026-07-29",
  sourceFamilyEvidence: ["family-a"],
};
const signature = (overrides: Partial<EventSignatureInput> = {}) =>
  buildEventSignature({ ...base, ...overrides }, NORMALIZATION_RULES_VERSION);

describe("80-case corpus contract: event portion", () => {
  it("contains the required 15 event-boundary cases and completes the 80-case corpus", () => {
    expect(corpus).toHaveLength(15);
    expect(new Set(corpus.map((fixture) => fixture.id)).size).toBe(15);
    expect(42 + 23 + corpus.length).toBe(80);
  });

  it.each(corpus)("keeps complete machine-readable expectations for $id", (fixture) => {
    expect(fixture.inputRecords.length).toBeGreaterThan(0);
    expect(Object.keys(fixture.expectedNormalizedResult).length).toBeGreaterThan(0);
    expect(fixture.expectedDuplicateOrVersionRelationship).toBeTruthy();
    expect(fixture.expectedEventRelationship).toBeTruthy();
    expect(fixture.expectedReviewStatus).toBeTruthy();
    expect(fixture.expectedExplanationCodes.length).toBeGreaterThan(0);
  });
});

describe("event signatures and boundaries", () => {
  it("merges reporting on the same filing-backed event across source families", () => {
    const left = signature({ policyOrFilingId: "filing-q2", sourceFamilyEvidence: ["family-a"] });
    const right = signature({
      id: "event-b",
      policyOrFilingId: "filing-q2",
      sourceFamilyEvidence: ["family-b"],
    });
    expect(decideEventBoundary(left, right).relationship).toBe("same_event");
  });

  it("does not merge events merely because entity and date match", () => {
    const earnings = signature();
    const downgrade = signature({
      id: "event-b",
      eventType: "analyst_action",
      action: "downgrades rating",
    });
    expect(decideEventBoundary(earnings, downgrade)).toMatchObject({
      relationship: "related_distinct_event",
      reviewRequired: false,
    });
  });

  it("separates proposal from final rule and rumor from confirmation", () => {
    const proposal = signature({ eventType: "regulation", action: "proposes export rule" });
    const finalRule = signature({
      id: "event-b",
      eventType: "regulation",
      action: "adopts final export rule",
    });
    expect(decideEventBoundary(proposal, finalRule).relationship).toBe("related_distinct_event");
    const rumor = signature({
      eventType: "merger_or_acquisition",
      action: "rumored acquisition",
    });
    const confirmation = signature({
      id: "event-c",
      eventType: "merger_or_acquisition",
      action: "confirmed acquisition",
    });
    expect(decideEventBoundary(rumor, confirmation).relationship).toBe("related_distinct_event");
  });

  it("separates a monetary-policy decision from a later speech", () => {
    const decision = signature({
      eventType: "monetary_policy",
      primaryEntityIds: ["agency-federal-reserve"],
      action: "announces rate decision",
    });
    const speech = signature({
      id: "event-b",
      eventType: "monetary_policy",
      primaryEntityIds: ["agency-federal-reserve"],
      action: "delivers later speech",
    });
    expect(decideEventBoundary(decision, speech).relationship).toBe("different_event");
  });

  it("routes conflicting effective dates to review", () => {
    const left = signature({ effectiveDate: "2026-08-01" });
    const right = signature({ id: "event-b", effectiveDate: "2027-01-01" });
    expect(decideEventBoundary(left, right)).toMatchObject({
      relationship: "review_required",
      reviewRequired: true,
    });
  });

  it("separates quarters and geographies even for the same entity and event type", () => {
    const firstQuarter = signature({ quantitativeAnchors: ["2026-Q1"] });
    const secondQuarter = signature({ id: "event-b", quantitativeAnchors: ["2026-Q2"] });
    expect(decideEventBoundary(firstQuarter, secondQuarter).relationship).toBe("different_event");
    const us = signature({ geography: "United States" });
    const europe = signature({ id: "event-c", geography: "Europe" });
    expect(decideEventBoundary(us, europe).relationship).toBe("different_event");
  });

  it("links a correction to the initial economic release", () => {
    const release = signature({
      eventType: "economic_release",
      primaryEntityIds: ["agency-bls"],
      action: "publishes employment release",
    });
    const correction = signature({
      id: "event-b",
      eventType: "economic_release",
      primaryEntityIds: ["agency-bls"],
      action: "corrects employment release",
    });
    expect(decideEventBoundary(release, correction).relationship).toBe("updated_same_event");
  });

  it("represents two distinct events from one article as two signatures", () => {
    const signatures = [
      signature({ eventType: "guidance", action: "updates guidance" }),
      signature({
        id: "event-b",
        eventType: "management_change",
        action: "appoints executive",
      }),
    ];
    expect(signatures).toHaveLength(2);
    expect(decideEventBoundary(signatures[0]!, signatures[1]!).relationship).toBe(
      "related_distinct_event",
    );
    expect(signatures.every((item) => item.rulesVersion === "normalization-v1")).toBe(true);
  });
});
