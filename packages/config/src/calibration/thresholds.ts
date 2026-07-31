import { calibrationObjectives } from "@cluster-mkt/core";

export const calibrationThresholdCandidates = [
  {
    thresholdId: "url_near_duplicate",
    current: 0.92,
    candidates: [0.9, 0.92, 0.94, 0.96],
    objective: calibrationObjectives.urlNearDuplicate,
  },
  {
    thresholdId: "syndication",
    current: 0.88,
    candidates: [0.86, 0.88, 0.9, 0.92],
    objective: calibrationObjectives.syndication,
  },
  {
    thresholdId: "article_version",
    current: 0.85,
    candidates: [0.82, 0.85, 0.88, 0.9],
    objective: calibrationObjectives.articleVersion,
  },
  {
    thresholdId: "entity_resolution",
    current: 0.9,
    candidates: [0.88, 0.9, 0.93, 0.96],
    objective: calibrationObjectives.entityResolution,
  },
  {
    thresholdId: "ticker_disambiguation",
    current: 0.97,
    candidates: [0.95, 0.97, 0.98, 0.99],
    objective: calibrationObjectives.entityResolution,
  },
  {
    thresholdId: "event_similarity",
    current: 0.86,
    candidates: [0.83, 0.86, 0.89, 0.92],
    objective: calibrationObjectives.eventSimilarity,
  },
  {
    thresholdId: "cluster_membership",
    current: 0.84,
    candidates: [0.82, 0.84, 0.87, 0.9],
    objective: calibrationObjectives.clusterMembership,
  },
  {
    thresholdId: "claim_equivalence",
    current: 0.9,
    candidates: [0.88, 0.9, 0.93, 0.96],
    objective: calibrationObjectives.claimEquivalence,
  },
  {
    thresholdId: "sector_materiality",
    current: 0.72,
    candidates: [0.7, 0.72, 0.76, 0.8],
    objective: calibrationObjectives.sectorMateriality,
  },
  {
    thresholdId: "review_routing",
    current: 0.68,
    candidates: [0.62, 0.68, 0.74, 0.8],
    objective: calibrationObjectives.reviewRouting,
  },
] as const;

export const calibrationThresholdVersion = {
  version: "calibration-v1",
  corpusVersion: "gold-corpus-v1",
  approvalStatus: "blocked_pending_human_review",
  automaticallyApplied: false,
} as const;
