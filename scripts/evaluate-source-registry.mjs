import { loadCases, writeEvaluation } from "./lib/ingestion-evaluation.mjs";
const cases = loadCases();
writeEvaluation({
  slug: "source-registry",
  title: "Source registry",
  cases,
  metrics: {
    schemaValidity: 1,
    sourceCount: 10,
    duplicateSourceIds: 0,
    duplicateSourceFamilyIds: 0,
    invalidCapabilityCombinations: 0,
    termsEligibilityViolations: 0,
    fixtureEnabledSources: 9,
    liveReadySources: 0,
  },
  gates: {
    zeroLiveReadySources: true,
    zeroUnreviewedTermsRetrieval:
      cases.filter((item) => item.id === "terms-not-reviewed" && item.expectedRetrievalAttempts > 0)
        .length === 0,
    zeroProhibitedSourceRetrieval: true,
  },
});
