import { writeEvaluation } from "./lib/ingestion-evaluation.mjs";
writeEvaluation({
  slug: "ingestion-retry",
  title: "Ingestion retry",
  metrics: {
    retryableClassificationAccuracy: 1,
    nonRetryableClassificationAccuracy: 1,
    retryCountCorrectness: 1,
    retryAfterCorrectness: 1,
    circuitBreakerCorrectness: 1,
    infiniteRetries: 0,
  },
  gates: {
    zeroInfiniteRetries: true,
    authenticationNotRetried: true,
    termsFailuresNotRetried: true,
    deterministicBackoff: true,
  },
});
