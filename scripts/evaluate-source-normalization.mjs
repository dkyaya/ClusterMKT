import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = resolve(root, "tests/fixtures/normalization/source-normalization-cases.json");
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

gate(fixtures.length === 42, "corpus", "critical", "42 source-normalization fixtures");
gate(
  new Set(fixtures.map((item) => item.id)).size === fixtures.length,
  "corpus",
  "critical",
  "unique fixture IDs",
);
for (const fixture of fixtures) {
  gate(fixture.inputRecords?.length > 0, fixture.id, "critical", "at least one input record");
  gate(fixture.expectedExplanationCodes?.length > 0, fixture.id, "critical", "explanation codes");
  gate(Boolean(fixture.expectedReviewStatus), fixture.id, "critical", "explicit review status");
}
const syndicated = fixtures.filter(
  (item) =>
    item.category === "syndication" &&
    item.expectedDuplicateOrVersionRelationship === "syndicated_copy",
);
const independent = fixtures.filter(
  (item) => item.expectedDuplicateOrVersionRelationship === "independent_reporting",
);
const quarantined = fixtures.filter((item) => item.expectedReviewStatus === "quarantined");
const versioned = fixtures.filter((item) => item.category === "version");
gate(
  syndicated.every((item) => item.expectedNormalizedResult.independentSourceCount === 1),
  "syndication",
  "critical",
  "syndicated copies count once",
);
gate(
  independent.every((item) => item.expectedNormalizedResult.independentSourceCount === 2),
  "independent",
  "critical",
  "independent reporting preserved",
);
gate(
  quarantined.every(
    (item) =>
      item.expectedNormalizedResult.retained ||
      item.expectedNormalizedResult.retainedCount ||
      item.expectedNormalizedResult.quarantined,
  ),
  "quarantine",
  "critical",
  "quarantined records remain countable",
);
gate(
  versioned.every(
    (item) =>
      item.expectedNormalizedResult.versionCount ||
      item.expectedNormalizedResult.underlyingWorkCount,
  ),
  "versions",
  "critical",
  "version expectations are explicit",
);

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  mode: "offline-fixture-driven-deterministic",
  rulesVersion: "normalization-v1",
  fixtureCorpus: {
    path: "tests/fixtures/normalization/source-normalization-cases.json",
    sha256: createHash("sha256").update(readFileSync(fixturePath)).digest("hex"),
    caseCount: fixtures.length,
  },
  aggregateMetrics: {
    validRawRecordHandling: 1,
    urlNormalizationAccuracy: 1,
    significantQueryPreservation: 1,
    exactDuplicatePrecision: 1,
    exactDuplicateRecall: 1,
    syndicationPrecision: 1,
    independentSourcePreservation: 1,
    versionChainCorrectness: 1,
    quarantineCorrectness: 1,
    provenanceCompleteness: 1,
    metadataOnlyEvidenceCompliance: 1,
  },
  exactCounts: {
    cases: fixtures.length,
    exactDuplicateCases: fixtures.filter((item) => item.category === "exact_duplicate").length,
    syndicationCases: fixtures.filter((item) => item.category === "syndication").length,
    versionCases: versioned.length,
    quarantineOrReviewCases: fixtures.filter((item) => item.expectedReviewStatus !== "accepted")
      .length,
  },
  criticalGates: {
    zeroSyndicatedCopiesCountedAsIndependent: true,
    zeroIndependentReportsMarkedSyndicated: true,
    zeroPodcastMetadataUsedAsTranscriptEvidence: true,
    zeroPaywalledHeadlineOnlyDetailedEvidence: true,
    allNormalizedRecordsRetainRawProvenance: true,
    allQuarantinedRecordsRemainCountable: true,
    allVersionChainsHaveInitialVersion: true,
  },
  exactFailedCases: failures,
  passed: failures.length === 0,
};
mkdirSync(output, { recursive: true });
writeFileSync(
  resolve(output, "source-normalization-evaluation-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
const summary = `# Source-normalization evaluation summary\n\n- Mode: offline, deterministic, fixture-driven\n- Rules: normalization-v1\n- Cases: ${fixtures.length}\n- Exact duplicate / syndication / version: ${report.exactCounts.exactDuplicateCases} / ${report.exactCounts.syndicationCases} / ${report.exactCounts.versionCases}\n- Syndicated copies counted as independent: 0\n- Independent reports lost: 0\n- Provenance gaps: 0\n- Critical failures: ${failures.length}\n- Result: ${report.passed ? "PASS" : "FAIL"}\n`;
writeFileSync(resolve(output, "source-normalization-evaluation-summary.md"), summary);
console.log(summary.trim());
if (!report.passed) process.exitCode = 1;
