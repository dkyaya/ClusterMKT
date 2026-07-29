import { operationalSourceRegistry } from "@cluster-mkt/config";
import { buildIdempotencyKey, createScheduledSlot, reconcileIngestion } from "@cluster-mkt/core";
import { processClustering } from "./process-clustering";
import { processSectorBriefs } from "./process-sector-briefs";
import { reportRun } from "./report-run";

export function runOfflineIngestion(input: {
  marketDate: string;
  edition: "morning" | "midday" | "closing";
  utcOffset?: "-04:00" | "-05:00";
}) {
  const slot = createScheduledSlot({
    marketDate: input.marketDate,
    edition: input.edition,
    utcOffset: input.utcOffset ?? "-04:00",
  });
  const runId = `run-${buildIdempotencyKey("run", [slot.scheduledSlotId, "ingestion-fixtures-v1"]).slice(0, 16)}`;
  const sources = operationalSourceRegistry.filter((source) => source.fixtureRetrievalEnabled);
  const rawIds = [
    "raw-government-release",
    "raw-company-release",
    "raw-news-analysis",
    "raw-podcast-metadata",
    "raw-malformed-url",
  ];
  const states = {
    "raw-government-release": ["accepted_normalized"],
    "raw-company-release": ["accepted_normalized"],
    "raw-news-analysis": ["accepted_normalized"],
    "raw-podcast-metadata": ["review_required"],
    "raw-malformed-url": ["quarantined"],
  } as const;
  const clusters = processClustering([
    { id: "cluster-export-controls", reviewStatus: "accepted", eligibleForDisplay: true },
    { id: "cluster-rumor", reviewStatus: "review_required", eligibleForDisplay: false },
    { id: "cluster-unsupported", reviewStatus: "rejected", eligibleForDisplay: false },
  ]);
  const briefs = processSectorBriefs({
    sectorId: "semiconductors",
    marketDate: input.marketDate,
    edition: input.edition,
    acceptedClusterIds: clusters.accepted.map((cluster) => cluster.id),
  });
  const reconciliation = reconcileIngestion({
    runId,
    rawRecordIds: rawIds,
    states,
    counts: {
      sourcesSelected: sources.length,
      normalizedRecords: 3,
      acceptedClusters: clusters.accepted.length,
      reviewRequiredClusters: clusters.reviewRequired.length,
      rejectedClusters: clusters.rejected.length,
      sectorBriefs: briefs.length,
      quarantinedRecords: 1,
    },
  });
  return {
    runId,
    slot,
    sources,
    rawIds,
    clusters,
    briefs,
    reconciliation,
    report: reportRun({
      runId,
      sourceCount: sources.length,
      rawCount: rawIds.length,
      normalizedCount: 3,
      acceptedClusterCount: clusters.accepted.length,
      sectorBriefCount: briefs.length,
      reconciled: reconciliation.reconciled,
    }),
  };
}
