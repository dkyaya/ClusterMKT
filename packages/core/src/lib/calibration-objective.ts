export const calibrationObjectives = {
  urlNearDuplicate:
    "Maximize critical precision before recall while preserving significant URL parameters.",
  syndication: "Prevent independent-source inflation without collapsing original reporting.",
  articleVersion: "Link genuine updates without merging new works.",
  entityResolution:
    "Accept explicit entities while preserving zero ambiguous-ticker false positives.",
  eventSimilarity: "Merge same-event reporting without company-and-date-only merges.",
  clusterMembership: "Prioritize correct event boundaries and route ambiguity for review.",
  claimEquivalence: "Preserve timing, units, attribution, and material quantitative differences.",
  sectorMateriality: "Prevent company-specific events from false sector-wide promotion.",
  reviewRouting: "Allow additional review when uncertainty protects critical precision.",
} as const;
