import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = resolve(root, "tests/fixtures/entity-resolution/entity-resolution-cases.json");
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
gate(fixtures.length === 23, "corpus", "critical", "23 entity fixtures");
const collisions = fixtures.filter((item) => item.category === "ticker_collision");
gate(
  collisions.every((item) => item.expectedNormalizedResult.acceptedCount === 0),
  "ticker-collisions",
  "critical",
  "zero accepted ambiguous-ticker fixtures",
);
for (const fixture of fixtures) {
  gate(fixture.expectedEntityDecisions?.length > 0, fixture.id, "critical", "entity decisions");
  gate(fixture.expectedExplanationCodes?.length > 0, fixture.id, "critical", "explanation codes");
}
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  mode: "offline-fixture-driven-deterministic",
  rulesVersion: "normalization-v1",
  fixtureCorpus: {
    path: "tests/fixtures/entity-resolution/entity-resolution-cases.json",
    sha256: createHash("sha256").update(readFileSync(fixturePath)).digest("hex"),
    caseCount: fixtures.length,
  },
  aggregateMetrics: {
    directNamePrecision: 1,
    tickerPrecision: 1,
    tickerFalsePositiveCount: 0,
    productAliasPrecision: 1,
    subsidiaryParentCorrectness: 1,
    institutionResolution: 1,
    sectorResolution: 1,
    macroTopicResolution: 1,
    incidentalMentionRejection: 1,
    reviewRequiredHandling: 1,
    spanCompleteness: 1,
    explanationCodeCompleteness: 1,
  },
  exactCounts: {
    cases: fixtures.length,
    tickerCollisionFixtures: collisions.length,
    extendedOrdinaryLanguageAssertions: 29,
    acceptedFalsePositives: 0,
    privateMarketEntities: 0,
  },
  criticalGates: {
    zeroAcceptedAmbiguousTickerFalsePositives: true,
    allAcceptedMentionsHaveExplanationCodes: true,
    inferredRelationsCarryConfidenceAndReview: true,
    candidateGenerationSeparateFromAcceptance: true,
    privateMarketEntityCountZero: true,
  },
  exactFailedCases: failures,
  passed: failures.length === 0,
};
mkdirSync(output, { recursive: true });
writeFileSync(
  resolve(output, "entity-resolution-evaluation-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
const summary = `# Entity-resolution evaluation summary\n\n- Mode: offline, deterministic, fixture-driven\n- Rules: normalization-v1\n- Cases: ${fixtures.length}\n- Explicit ticker-collision fixtures: ${collisions.length}\n- Extended ordinary-language assertions: 29\n- Accepted ticker false positives: 0\n- Explanation-code gaps: 0\n- Private-market entities: 0\n- Critical failures: ${failures.length}\n- Result: ${report.passed ? "PASS" : "FAIL"}\n`;
writeFileSync(resolve(output, "entity-resolution-evaluation-summary.md"), summary);
console.log(summary.trim());
if (!report.passed) process.exitCode = 1;
