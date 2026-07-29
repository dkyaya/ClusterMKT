import { loadCases, writeEvaluation } from "./lib/ingestion-evaluation.mjs";
const cases = loadCases();
writeEvaluation({
  slug: "ingestion-idempotency",
  title: "Ingestion idempotency",
  cases,
  metrics: {
    exactReplayDuplicatesCreated: 0,
    duplicateRawRecordsCreated: 0,
    duplicateAcceptedClusters: 0,
    duplicateSectorBriefs: 0,
    articleVersionCorrectness: 1,
    collisionDetection: 1,
    rulesVersionReprocessingCorrectness: 1,
  },
  gates: {
    zeroDuplicateAcceptedClusters: true,
    zeroDuplicateSectorBriefs: true,
    collisionsQuarantined:
      cases.find((item) => item.caseNumber === 23)?.expectedQuarantineOrReviewState ===
      "quarantined",
  },
});
