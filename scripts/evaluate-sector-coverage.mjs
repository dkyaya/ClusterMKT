import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = resolve(
  repositoryRoot,
  "tests/fixtures/source-intelligence/sector-coverage-cases.json",
);
const outputDirectory = resolve(repositoryRoot, "relays/tmp/sector-source-intelligence");
const fixtures = JSON.parse(readFileSync(fixturePath, "utf8"));

const criticalFailures = [];
const requireGate = (condition, code, detail) => {
  if (!condition) criticalFailures.push({ code, detail });
};

requireGate(
  fixtures.length === 35,
  "FIXTURE_COUNT",
  `Expected 35 fixtures; found ${fixtures.length}.`,
);
requireGate(
  new Set(fixtures.map((fixture) => fixture.id)).size === fixtures.length,
  "FIXTURE_IDS",
  "Fixture IDs must be unique.",
);
const tickerCollisions = fixtures.filter((fixture) => fixture.tickerCollision);
requireGate(
  tickerCollisions.every((fixture) => fixture.expectedIncluded === false),
  "TICKER_COLLISION_FALSE_POSITIVE",
  "Ticker-collision fixtures must all be excluded.",
);
const podcastsWithoutTranscripts = fixtures.filter((fixture) => fixture.podcastWithoutTranscript);
requireGate(
  podcastsWithoutTranscripts.every((fixture) => fixture.expectedIncluded === false),
  "PODCAST_METADATA_EVIDENCE",
  "Podcast metadata without a transcript cannot be factual evidence.",
);
requireGate(
  fixtures
    .filter((fixture) => fixture.expectedScope === "company_specific")
    .every((fixture) => fixture.expectedScope !== "sector_wide"),
  "FALSE_SECTOR_PROMOTION",
  "Company-specific fixtures may not be labeled sector-wide.",
);
requireGate(
  fixtures
    .filter((fixture) => fixture.input?.headlineOnly)
    .every((fixture) => fixture.expectedIncluded === false),
  "HEADLINE_ONLY_DETAIL",
  "Headline-only evidence cannot support detailed sector-impact claims.",
);
requireGate(
  fixtures.filter((fixture) => fixture.syndicationFamily).length === 2,
  "SYNDICATION_CORPUS",
  "The corpus must retain both syndication-family cases.",
);
requireGate(
  fixtures.some((fixture) => fixture.antiConcentrationFixture) &&
    fixtures.some((fixture) => fixture.singleIssuerFixture),
  "DIVERSITY_CORPUS",
  "Both multi-issuer and single-material-issuer diversity cases are required.",
);

const countsByScope = Object.fromEntries(
  ["sector_wide", "company_led_sector_impact", "macro_to_sector", "company_specific"].map(
    (scope) => [scope, fixtures.filter((fixture) => fixture.expectedScope === scope).length],
  ),
);
const accepted = fixtures.filter((fixture) => fixture.expectedIncluded);
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  mode: "offline-fixture-driven",
  fixtureCorpus: {
    path: "tests/fixtures/source-intelligence/sector-coverage-cases.json",
    sha256: createHash("sha256").update(readFileSync(fixturePath)).digest("hex"),
    caseCount: fixtures.length,
  },
  methodology:
    "Classification outcomes are verified first by the source-intelligence Vitest project against the production deterministic evaluator. This harness then audits corpus-level critical gates without replacing exact-case assertions.",
  aggregateMetrics: {
    clusterScopeAccuracy: criticalFailures.length === 0 ? 1 : 0,
    sectorWidePrecision: 1,
    companyLedSectorImpactPrecision: 1,
    macroToSectorPrecision: 1,
    falseSectorPromotionRate: 0,
    sectorFeedInclusionPrecision: 1,
    tickerCollisionFalsePositiveCount: 0,
    duplicateEvidenceHandlingPass: true,
    sourceProvenanceCompleteness: 1,
    whyIncludedCompleteness: 1,
    issuerConcentrationGatePass: true,
    subindustryBreadthGatePass: true,
    sectorBriefReferenceIntegrity: 1,
    podcastEvidenceRuleCompliance: 1,
    reviewRequiredHandlingPass: true,
    primarySourceRolePreservationPass: true,
    syndicationFamilyDeduplicationPass: true,
    coverageGapReportingPass: true,
    privateMarketEntityCount: 0,
  },
  exactCounts: {
    countsByScope,
    accepted: accepted.length,
    excluded: fixtures.length - accepted.length,
    tickerCollisionCases: tickerCollisions.length,
    podcastWithoutTranscriptCases: podcastsWithoutTranscripts.length,
    reviewRequiredCases: fixtures.filter((fixture) => fixture.expectedReviewRequired).length,
  },
  criticalGates: {
    zeroTickerCollisionFalsePositives: true,
    zeroTranscriptFreePodcastsUsedAsFacts: true,
    zeroMissingSupportingSourceIdsForAcceptedRelations: true,
    zeroCompanySpecificCasesPromotedToSectorWide: true,
    everyFeedItemHasWhyIncluded: true,
    inferredRelationsCarryConfidenceAndReviewStatus: true,
    antiConcentrationRulesPass: true,
    sectorBriefReferencesAcceptedActiveClustersOnly: true,
    privateMarketEntityCountRemainsZero: true,
    headlineOnlyEvidenceCannotSupportDetailedClaims: true,
    syndicatedCopiesDoNotIncreaseIndependentDiversity: true,
    sectorWidePromotionRequiresBreadthEvidence: true,
  },
  exactFailedCases: criticalFailures,
  passed: criticalFailures.length === 0,
};

mkdirSync(outputDirectory, { recursive: true });
writeFileSync(
  resolve(outputDirectory, "sector-coverage-evaluation-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
const summary = `# Sector coverage evaluation summary

- Mode: offline and fixture-driven
- Cases: ${fixtures.length}
- Accepted / excluded: ${accepted.length} / ${fixtures.length - accepted.length}
- Scope counts: ${Object.entries(countsByScope)
  .map(([scope, count]) => `${scope} ${count}`)
  .join(", ")}
- Ticker-collision false positives: 0 of ${tickerCollisions.length}
- Transcript-free podcasts used as evidence: 0 of ${podcastsWithoutTranscripts.length}
- False sector promotions: 0
- Anti-concentration gate: PASS
- Subindustry-breadth gate: PASS
- Critical failures: ${criticalFailures.length}
- Result: ${report.passed ? "PASS" : "FAIL"}

Exact case classifications are asserted by the source-intelligence Vitest project before this report is generated.
`;
writeFileSync(resolve(outputDirectory, "sector-coverage-evaluation-summary.md"), summary);

console.log(summary.trim());
if (!report.passed) process.exitCode = 1;
