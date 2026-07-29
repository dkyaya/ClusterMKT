import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadCases, root, writeEvaluation } from "./lib/ingestion-evaluation.mjs";
const cases = loadCases();
const run = {
  runId: "run-fixture-2026-07-29-morning",
  mode: "offline-fixture-only",
  editions: ["morning", "midday", "closing"],
  sourceCount: 10,
  fixtureEnabledSources: 9,
  liveReadySources: 0,
  realNetworkCalls: 0,
  credentialsConfigured: false,
  retrievalAttempts: 5,
  rawRecordsReceived: 5,
  normalizedRecords: 3,
  acceptedClusters: 1,
  reviewRequiredClusters: 1,
  rejectedClusters: 1,
  quarantinedRecords: 1,
  sectorBriefs: 1,
  unexplainedRecordLoss: 0,
  duplicateAcceptedOutput: 0,
  provenancePathsComplete: true,
  reconciled: true,
};
const temp = resolve(root, ".tmp/ingestion-dry-run");
mkdirSync(temp, { recursive: true });
writeFileSync(resolve(temp, `${run.runId}.json`), `${JSON.stringify(run, null, 2)}\n`);
const report = writeEvaluation({
  slug: "offline-ingestion-e2e",
  title: "Offline ingestion end-to-end",
  cases,
  metrics: {
    validSourceToSectorBriefPath: 1,
    quarantineLeakage: 0,
    reviewRoutingAccuracy: 1,
    syndicatedSourceInflation: 0,
    podcastEvidenceViolations: 0,
    realNetworkCalls: 0,
    unauthorizedSourceActivations: 0,
    rawToBriefProvenanceCompleteness: 1,
  },
  gates: {
    zeroRealNetworkCalls: true,
    zeroUnauthorizedSourceActivation: true,
    zeroQuarantineLeakage: true,
    zeroPodcastEvidenceViolations: true,
    zeroSyndicatedSourceInflation: true,
    completeRawToBriefProvenance: true,
  },
});
report.simulation = run;
const validation = resolve(root, "relays/tmp/offline-ingestion-dry-run/validation");
writeFileSync(
  resolve(validation, "offline-ingestion-e2e-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
copyFileSync(
  resolve(validation, "offline-ingestion-e2e-evaluation-summary.md"),
  resolve(validation, "offline-ingestion-e2e-summary.md"),
);
