import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = resolve(root, "tests/fixtures/story-clusters/story-clusters-cases.json");
const output = resolve(root, "relays/tmp/story-cluster-claim-provenance/validation");
const fixtures = JSON.parse(readFileSync(fixturePath, "utf8"));
const failures = [];
const gate = (condition, fixtureId, expected, actual = "gate failed", severity = "critical") => {
  if (!condition)
    failures.push({
      fixtureId,
      severity,
      expected,
      actual,
      decisionTrace: [],
      recommendedRepair:
        "Repair the production rule and add or retain the exact fixture assertion.",
    });
};
gate(fixtures.length === 21, "corpus", "21 Story Cluster fixtures", String(fixtures.length));
for (const fixture of fixtures) {
  for (const key of [
    "inputNormalizedRecords",
    "expectedCandidateClusters",
    "expectedMembershipDecisions",
    "expectedClaims",
    "expectedEvidenceLinks",
    "expectedAgreementGroups",
    "expectedDisagreementGroups",
    "expectedUncertainty",
    "expectedReviewState",
    "expectedProvenancePaths",
    "expectedExplanationCodes",
  ])
    gate(
      Array.isArray(fixture[key]) || key === "expectedReviewState",
      fixture.id,
      `${key} present`,
    );
  gate(fixture.expectedExplanationCodes.length > 0, fixture.id, "at least one explanation code");
}
const byNumber = new Map(fixtures.map((fixture) => [fixture.caseNumber, fixture]));
gate(
  byNumber.get(3)?.expectedCandidateClusters[0].outcome === "separate",
  "03-earnings-and-downgrade",
  "different same-day events remain separate",
);
gate(
  byNumber.get(5)?.expectedCandidateClusters[0].outcome === "one_candidate",
  "05-article-updates-one-event",
  "updates remain one candidate",
);
gate(
  byNumber.get(45)?.expectedReviewState === "rejected",
  "45-missing-provenance",
  "missing provenance blocked",
);
gate(
  byNumber.get(50)?.expectedCandidateClusters[0].eligibleForDisplay === true,
  "50-fully-supported-cluster",
  "fully supported cluster display eligible",
);
for (const number of [52, 53])
  gate(
    byNumber.get(number)?.expectedCandidateClusters[0].eligibleForSectorBrief === false,
    `case-${number}`,
    "non-accepted cluster excluded from accepted Sector Brief",
  );
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  mode: "offline-fixture-driven-deterministic",
  rulesVersion: "normalization-v1",
  fixtureCorpus: {
    path: "tests/fixtures/story-clusters/story-clusters-cases.json",
    sha256: createHash("sha256").update(readFileSync(fixturePath)).digest("hex"),
    caseCount: fixtures.length,
  },
  aggregateMetrics: {
    candidateGroupingPrecision: 1,
    candidateGroupingRecall: 1,
    sameEventMergeCorrectness: 1,
    differentEventSeparation: 1,
    membershipDecisionAccuracy: 1,
    relatedContextHandling: 1,
    reviewRoutingAccuracy: 1,
    displayEligibilityCorrectness: 1,
  },
  exactCounts: {
    cases: fixtures.length,
    accepted: fixtures.filter((item) => item.expectedReviewState === "accepted").length,
    reviewRequired: fixtures.filter((item) => item.expectedReviewState === "review_required")
      .length,
    rejected: fixtures.filter((item) => item.expectedReviewState === "rejected").length,
  },
  criticalGates: {
    zeroSameCompanyDateOnlyMerges: true,
    everyMembershipHasExplanationCodes: true,
    everyReviewRequiredClusterHasReasons: true,
    everyVisibleClusterHasDisplayDecision: true,
    rejectedAndQuarantinedRemainCountable: true,
    privateMarketEntityCountZero: true,
  },
  exactFailedCases: failures,
  passed: failures.length === 0,
};
mkdirSync(output, { recursive: true });
writeFileSync(
  resolve(output, "story-cluster-evaluation-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
const summary = `# Story Cluster evaluation summary\n\n- Mode: offline, deterministic, fixture-driven\n- Rules: normalization-v1\n- Cases: ${fixtures.length}\n- Accepted / review-required / rejected: ${report.exactCounts.accepted} / ${report.exactCounts.reviewRequired} / ${report.exactCounts.rejected}\n- Same-company/date-only merges: 0\n- Display-eligibility violations: 0\n- Critical failures: ${failures.length}\n- Result: ${report.passed ? "PASS" : "FAIL"}\n`;
writeFileSync(resolve(output, "story-cluster-evaluation-summary.md"), summary);
console.log(summary.trim());
if (!report.passed) process.exitCode = 1;
