export const goldCorpusPartitioning = {
  version: "partition-v1",
  seed: "cluster-mkt-gold-v1-partitions",
  groupingKey: "event_or_underlying_work",
  ratios: { training: 0.6, calibration: 0.2, heldOut: 0.2 },
  leakageGuards: [
    "article_versions",
    "syndication_family",
    "underlying_work",
    "same_event",
    "near_duplicate_package",
  ],
} as const;
