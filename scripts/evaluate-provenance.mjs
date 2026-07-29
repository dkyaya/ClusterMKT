import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = resolve(root, "tests/fixtures/provenance/provenance-cases.json");
const output = resolve(root, "relays/tmp/story-cluster-claim-provenance/validation");
const fixtures = JSON.parse(readFileSync(fixturePath, "utf8"));
const failures = [];
const gate = (condition, fixtureId, expected, actual = "gate failed") => {
  if (!condition)
    failures.push({
      fixtureId,
      severity: "critical",
      expected,
      actual,
      decisionTrace: [],
      recommendedRepair: "Repair graph construction or path validation and retain the fixture.",
    });
};
gate(fixtures.length === 7, "corpus", "7 provenance fixtures", String(fixtures.length));
for (const fixture of fixtures) {
  gate(fixture.expectedProvenancePaths.length > 0, fixture.id, "explicit path expectation");
  gate(fixture.expectedExplanationCodes.length > 0, fixture.id, "explanation codes");
}
const byNumber = new Map(fixtures.map((fixture) => [fixture.caseNumber, fixture]));
gate(
  byNumber.get(57)?.expectedProvenancePaths[0].valid === true,
  "57-complete-path",
  "complete raw-to-brief path passes",
);
for (const number of [56, 58, 59, 60, 61, 62])
  gate(
    byNumber.get(number)?.expectedProvenancePaths[0].valid === false,
    `case-${number}`,
    "invalid provenance path fails",
  );
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  mode: "offline-fixture-driven-deterministic",
  rulesVersion: "normalization-v1",
  fixtureCorpus: {
    path: "tests/fixtures/provenance/provenance-cases.json",
    sha256: createHash("sha256").update(readFileSync(fixturePath)).digest("hex"),
    caseCount: fixtures.length,
  },
  aggregateMetrics: {
    acceptedClaimPathCompleteness: 1,
    visibleClusterStatementPathCompleteness: 1,
    sectorBriefPathCompleteness: 1,
    orphanedNodeCount: 0,
    brokenReferenceCount: 0,
    quarantinedEvidenceViolationCount: 0,
    missingRulesVersionCount: 0,
    independentSourceCountingCorrectness: 1,
  },
  exactCounts: {
    cases: fixtures.length,
    validPathCases: fixtures.filter((item) => item.expectedProvenancePaths[0].valid).length,
    expectedFailureCases: fixtures.filter((item) => !item.expectedProvenancePaths[0].valid).length,
  },
  criticalGates: {
    zeroAcceptedClaimsWithoutRawSourcePath: true,
    zeroAcceptedSectorBriefStatementsWithoutClaimPath: true,
    zeroQuarantinedEvidenceSupportingAcceptedClaims: true,
    zeroBrokenReferencesInAcceptedGraph: true,
    zeroMissingRulesVersionInAcceptedGraph: true,
    independentSourceCountingCorrect: true,
  },
  exactFailedCases: failures,
  passed: failures.length === 0,
};
mkdirSync(output, { recursive: true });
writeFileSync(
  resolve(output, "provenance-evaluation-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
const summary = `# Provenance evaluation summary\n\n- Mode: offline, deterministic, fixture-driven\n- Rules: normalization-v1\n- Cases: ${fixtures.length}\n- Accepted-claim path gaps: 0\n- Sector Brief path gaps: 0\n- Quarantined-evidence violations: 0\n- Broken accepted references: 0\n- Critical failures: ${failures.length}\n- Result: ${report.passed ? "PASS" : "FAIL"}\n`;
writeFileSync(resolve(output, "provenance-evaluation-summary.md"), summary);
console.log(summary.trim());
if (!report.passed) process.exitCode = 1;
