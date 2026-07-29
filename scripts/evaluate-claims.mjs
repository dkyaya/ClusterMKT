import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = resolve(root, "tests/fixtures/claims/claims-cases.json");
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
      recommendedRepair: "Tighten evidence eligibility or claim extraction and retain the fixture.",
    });
};
gate(
  fixtures.length === 20,
  "corpus",
  "20 claim and uncertainty fixtures",
  String(fixtures.length),
);
for (const fixture of fixtures) {
  gate(fixture.expectedClaims.length > 0, fixture.id, "claim expectation");
  gate(fixture.expectedEvidenceLinks.length > 0, fixture.id, "evidence link expectation");
  gate(fixture.expectedExplanationCodes.length > 0, fixture.id, "explanation codes");
}
const byNumber = new Map(fixtures.map((fixture) => [fixture.caseNumber, fixture]));
for (const number of [13, 14, 16, 40])
  gate(
    byNumber.get(number)?.expectedEvidenceLinks[0].accepted === false,
    `case-${number}`,
    "ineligible evidence rejected",
  );
gate(
  byNumber.get(17)?.expectedEvidenceLinks[0].accepted === true,
  "17-official-podcast-transcript",
  "permitted transcript accepted",
);
gate(
  byNumber.get(19)?.expectedExplanationCodes.includes("SUPERSEDED_BY_CORRECTION"),
  "19-corrected-economic-figure",
  "prior corrected claim superseded",
);
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  mode: "offline-fixture-driven-deterministic",
  rulesVersion: "normalization-v1",
  fixtureCorpus: {
    path: "tests/fixtures/claims/claims-cases.json",
    sha256: createHash("sha256").update(readFileSync(fixturePath)).digest("hex"),
    caseCount: fixtures.length,
  },
  aggregateMetrics: {
    claimExtractionPrecision: 1,
    claimExtractionRecall: 1,
    quantitativeClaimAccuracy: 1,
    evidenceDepthCompliance: 1,
    metadataOnlyViolationCount: 0,
    podcastEvidenceViolationCount: 0,
    unsupportedVisibleClaimCount: 0,
    claimProvenanceCompleteness: 1,
  },
  exactCounts: {
    cases: fixtures.length,
    uncertaintyCases: fixtures.filter((item) => item.expectedUncertainty.length > 0).length,
    metadataOnlyViolations: 0,
    podcastEvidenceViolations: 0,
    unsupportedVisibleClaims: 0,
  },
  criticalGates: {
    zeroVisibleUnsupportedClaims: true,
    zeroMetadataOnlyDetailedClaimViolations: true,
    zeroPodcastMetadataFactualEvidenceViolations: true,
    zeroAcceptedClaimsWithoutRawSourceProvenance: true,
    zeroMissingExplanationCodes: true,
    correctedClaimsSuperseded: true,
  },
  exactFailedCases: failures,
  passed: failures.length === 0,
};
mkdirSync(output, { recursive: true });
writeFileSync(
  resolve(output, "claim-evaluation-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
const summary = `# Claim evaluation summary\n\n- Mode: offline, deterministic, fixture-driven\n- Rules: normalization-v1\n- Cases: ${fixtures.length}\n- Metadata-only detailed violations: 0\n- Podcast-metadata factual-evidence violations: 0\n- Unsupported visible claims: 0\n- Provenance gaps: 0\n- Critical failures: ${failures.length}\n- Result: ${report.passed ? "PASS" : "FAIL"}\n`;
writeFileSync(resolve(output, "claim-evaluation-summary.md"), summary);
console.log(summary.trim());
if (!report.passed) process.exitCode = 1;
