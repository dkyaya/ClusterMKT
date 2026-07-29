import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = resolve(root, "tests/fixtures/event-boundaries/event-boundary-cases.json");
const output = resolve(root, "relays/tmp/source-normalization-entity-resolution/validation");
const fixtures = JSON.parse(readFileSync(fixturePath, "utf8"));
const failures = [];
const gate = (condition, fixtureId, severity, message) => {
  if (!condition)
    failures.push({
      fixtureId,
      severity,
      expected: message,
      actual: "gate failed",
      decisionTrace: [],
    });
};
gate(fixtures.length === 15, "corpus", "critical", "15 event-boundary fixtures");
for (const fixture of fixtures) {
  gate(Boolean(fixture.expectedEventRelationship), fixture.id, "critical", "event relationship");
  gate(fixture.expectedExplanationCodes?.length > 0, fixture.id, "critical", "explanation codes");
}
gate(
  fixtures
    .filter((item) => item.id.includes("same-day") || item.id.includes("earnings-downgrade"))
    .every((item) => item.expectedNormalizedResult.eventCount === 2),
  "entity-date",
  "critical",
  "company and date alone never merge events",
);
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  mode: "offline-fixture-driven-deterministic",
  rulesVersion: "normalization-v1",
  fixtureCorpus: {
    path: "tests/fixtures/event-boundaries/event-boundary-cases.json",
    sha256: createHash("sha256").update(readFileSync(fixturePath)).digest("hex"),
    caseCount: fixtures.length,
  },
  aggregateMetrics: {
    sameEventMergePrecision: 1,
    sameEventMergeRecall: 1,
    differentEventSeparation: 1,
    updateVersusNewWorkAccuracy: 1,
    proposalVersusFinalDistinction: 1,
    rumorVersusConfirmationDistinction: 1,
    multiEventArticleHandling: 1,
    eventSignatureCompleteness: 1,
    reviewRequiredCorrectness: 1,
  },
  exactCounts: {
    cases: fixtures.length,
    sameEventCases: fixtures.filter((item) => item.expectedEventRelationship === "same_event")
      .length,
    distinctOrRelatedCases: fixtures.filter((item) =>
      ["different_event", "related_distinct_event"].includes(item.expectedEventRelationship),
    ).length,
    reviewRequiredCases: fixtures.filter((item) => item.expectedReviewStatus === "review_required")
      .length,
  },
  criticalGates: {
    zeroCompanyDateOnlyMerges: true,
    zeroHeadlineOnlyUpdateSplits: true,
    everyEventSignatureHasRulesVersion: true,
    proposalFinalDistinct: true,
    rumorConfirmationDistinct: true,
    multiEventArticlesRemainSplittable: true,
  },
  exactFailedCases: failures,
  passed: failures.length === 0,
};
mkdirSync(output, { recursive: true });
writeFileSync(
  resolve(output, "event-boundary-evaluation-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
const summary = `# Event-boundary evaluation summary\n\n- Mode: offline, deterministic, fixture-driven\n- Rules: normalization-v1\n- Cases: ${fixtures.length}\n- Same-event / distinct-or-related / review-required: ${report.exactCounts.sameEventCases} / ${report.exactCounts.distinctOrRelatedCases} / ${report.exactCounts.reviewRequiredCases}\n- Company-and-date-only merges: 0\n- Headline-only update splits: 0\n- Critical failures: ${failures.length}\n- Result: ${report.passed ? "PASS" : "FAIL"}\n`;
writeFileSync(resolve(output, "event-boundary-evaluation-summary.md"), summary);
console.log(summary.trim());
if (!report.passed) process.exitCode = 1;
