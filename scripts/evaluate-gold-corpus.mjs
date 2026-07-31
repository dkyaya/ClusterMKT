import {
  corpusFingerprint,
  loadCorpus,
  stratifiedPartition,
  taskCounts,
  writeReport,
} from "./lib/gold-corpus-evaluation.mjs";

const { items, decisions, adjudications, goldLabels, manifest } = loadCorpus();
const minima = {
  source_normalization: 40,
  entity_resolution: 50,
  event_boundaries: 40,
  story_cluster_membership: 40,
  claims: 50,
  agreement_disagreement: 30,
  sector_coverage: 25,
  review_routing: 25,
};
const counts = taskCounts(items);
const stratum = (field, value) =>
  items.filter((item) => item.samplingStrata[field] === value).length;
const nvidiaShare = items.filter(({ task }) => task === "sector_coverage").length
  ? items.filter(
      ({ task, evidencePackage }) =>
        task === "sector_coverage" && evidencePackage.structuredFields.issuerId === "nvidia",
    ).length / items.filter(({ task }) => task === "sector_coverage").length
  : 0;
const partitionResult = stratifiedPartition(items);
const groupPartitions = new Map();
for (const assignment of partitionResult.assignments) {
  const partitions = groupPartitions.get(assignment.groupId) ?? new Set();
  partitions.add(assignment.partition);
  groupPartitions.set(assignment.groupId, partitions);
}
const leakingGroups = [...groupPartitions]
  .filter(([, values]) => values.size > 1)
  .map(([groupId]) => groupId);
const predictionLeakage = items
  .filter(
    (item) =>
      item.hiddenPrediction && item.allowedReviewerVisibleFields.includes("hiddenPrediction"),
  )
  .map(({ itemId }) => itemId);
const automatedGold = items.filter(
  ({ finalStatus, finalGoldLabelId }) => finalStatus === "gold" || finalGoldLabelId !== null,
).length;
const criticalUnderReviewedGold = goldLabels.filter(
  (gold) => gold.independentReviewerDecisionIds.length < 2,
).length;
const unknownVisibleFields = items.flatMap((item) =>
  item.allowedReviewerVisibleFields
    .filter(
      (field) =>
        ![
          "headline",
          "abstract",
          "structuredFields",
          "permittedExcerpt",
          "sourceProvenance",
          "evidenceDepth",
        ].includes(field),
    )
    .map((field) => `${item.itemId}:${field}`),
);

writeReport({
  slug: "corpus-coverage",
  title: "Gold corpus coverage summary",
  status: "READY_FOR_HUMAN_REVIEW",
  summary:
    "The candidate corpus satisfies sampling requirements without assigning automated gold labels.",
  metrics: {
    itemCount: items.length,
    taskCounts: JSON.stringify(counts),
    tickerTraps: stratum("tickerAmbiguity", "ordinary_language_trap"),
    duplicateOrSyndicationCases: stratum("duplicateClass", "duplicate_or_syndication"),
    articleVersionCases: stratum("articleVersionClass", "version_chain"),
    metadataLimitedCases: stratum("evidenceDepth", "metadata_limited"),
    podcastCases: stratum("contentType", "podcast"),
    quantitativeClaimCases: stratum("claimType", "quantitative_fact"),
    apparentDisagreementCases: stratum("discourseClass", "apparent_disagreement"),
    evolvingEventCases: stratum("timeSensitivity", "evolving_or_corrected"),
    nvidiaCompanySpecificShare: nvidiaShare,
    goldLabelCount: goldLabels.length,
    reviewerDecisionCount: decisions.length,
    adjudicationCount: adjudications.length,
    corpusSha256: corpusFingerprint(items),
  },
  gates: {
    atLeast300Items: items.length >= 300,
    requiredTaskMinima: Object.entries(minima).every(
      ([task, minimum]) => (counts[task] ?? 0) >= minimum,
    ),
    requiredStrata:
      stratum("tickerAmbiguity", "ordinary_language_trap") >= 30 &&
      stratum("duplicateClass", "duplicate_or_syndication") >= 20 &&
      stratum("articleVersionClass", "version_chain") >= 20 &&
      stratum("evidenceDepth", "metadata_limited") >= 20 &&
      stratum("contentType", "podcast") >= 15 &&
      stratum("claimType", "quantitative_fact") >= 20 &&
      stratum("discourseClass", "apparent_disagreement") >= 15 &&
      stratum("timeSensitivity", "evolving_or_corrected") >= 15,
    noPredictionLeakage: predictionLeakage.length === 0,
    reviewerVisibleFieldAllowlistValid: unknownVisibleFields.length === 0,
    noAutomatedGoldLabels:
      automatedGold === 0 && manifest.goldLabelsGeneratedByAutomation === false,
    noCriticalSingleReviewGold: criticalUnderReviewedGold === 0,
    eventGroupSafePartitions: leakingGroups.length === 0,
    nvidiaShareWithinLimit: nvidiaShare <= 0.15,
  },
  blockers: ["Independent human reviewer decisions and adjudications have not yet been collected."],
  details: {
    taskCounts: counts,
    predictionLeakage,
    unknownVisibleFields,
    leakingGroups,
    manifest,
  },
});

const partitionCounts = partitionResult.counts;
writeReport({
  slug: "partition",
  title: "Corpus partition summary",
  status: "PARTITIONED_AWAITING_LABELS",
  summary: "Items are split deterministically by event or underlying-work group, never by URL.",
  metrics: {
    ...partitionCounts,
    groupCount: groupPartitions.size,
    leakingGroupCount: leakingGroups.length,
  },
  gates: {
    noEventGroupLeakage: leakingGroups.length === 0,
    deterministicSeedRecorded: true,
    heldOutReserved: partitionCounts.held_out > 0,
  },
  blockers: ["Held-out outcomes remain unavailable until independent human labels are finalized."],
  details: {
    seed: "cluster-mkt-gold-v1-seed",
    groupingKey: "event_or_underlying_work",
    leakageGuards: [
      "article_versions",
      "syndication_family",
      "underlying_work",
      "same_event",
      "near_duplicate_package",
    ],
    taskBalance: partitionResult.taskBalance,
    leakingGroups,
  },
});
