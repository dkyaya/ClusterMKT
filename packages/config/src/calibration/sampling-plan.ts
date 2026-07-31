import type { SamplingPlan } from "@cluster-mkt/core";

export const goldCorpusSamplingPlan: SamplingPlan = {
  samplingPlanVersion: "sampling-v1",
  corpusVersion: "gold-corpus-v1",
  deterministicSeed: "cluster-mkt-gold-v1-seed",
  targetItemCount: 345,
  taskMinimums: {
    source_normalization: 45,
    entity_resolution: 60,
    event_boundaries: 45,
    story_cluster_membership: 45,
    claims: 55,
    agreement_disagreement: 35,
    sector_coverage: 30,
    review_routing: 30,
  },
  strataMinimums: [
    { dimension: "tickerAmbiguity", value: "ordinary_language_trap", minimum: 30 },
    { dimension: "duplicateClass", value: "duplicate_or_syndication", minimum: 20 },
    { dimension: "articleVersionClass", value: "version_chain", minimum: 20 },
    { dimension: "evidenceDepth", value: "metadata_limited", minimum: 20 },
    { dimension: "contentType", value: "podcast", minimum: 15 },
    { dimension: "claimType", value: "quantitative_fact", minimum: 20 },
    { dimension: "discourseClass", value: "apparent_disagreement", minimum: 15 },
    { dimension: "timeSensitivity", value: "evolving_or_corrected", minimum: 15 },
  ],
  maximumCompanyShare: 0.15,
  partitionRatios: { training: 0.6, calibration: 0.2, heldOut: 0.2 },
};
