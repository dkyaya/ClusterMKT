import { loadCorpus, stratifiedPartition, writeReport } from "./lib/gold-corpus-evaluation.mjs";

const { items, goldLabels } = loadCorpus();
const thresholdDefinitions = [
  [
    "url_near_duplicate",
    0.92,
    [0.9, 0.92, 0.94, 0.96],
    "Critical precision before recall; preserve significant URL parameters.",
  ],
  [
    "syndication",
    0.88,
    [0.86, 0.88, 0.9, 0.92],
    "Prevent source-count inflation without collapsing independent reporting.",
  ],
  [
    "article_version",
    0.85,
    [0.82, 0.85, 0.88, 0.9],
    "Link genuine updates while preserving new underlying works.",
  ],
  ["entity_resolution", 0.9, [0.88, 0.9, 0.93, 0.96], "Optimize entity precision before recall."],
  [
    "ticker_disambiguation",
    0.97,
    [0.95, 0.97, 0.98, 0.99],
    "Require zero accepted ambiguous-ticker false positives.",
  ],
  ["event_similarity", 0.86, [0.83, 0.86, 0.89, 0.92], "Avoid company-and-date-only event merges."],
  [
    "cluster_membership",
    0.84,
    [0.82, 0.84, 0.87, 0.9],
    "Protect event boundaries and route ambiguity to review.",
  ],
  [
    "claim_equivalence",
    0.9,
    [0.88, 0.9, 0.93, 0.96],
    "Preserve period, unit, scope, and attribution differences.",
  ],
  ["sector_materiality", 0.72, [0.7, 0.72, 0.76, 0.8], "Avoid false sector-wide promotion."],
  [
    "review_routing",
    0.68,
    [0.62, 0.68, 0.74, 0.8],
    "Prefer additional review when critical uncertainty remains.",
  ],
];
const goldByItem = new Map(goldLabels.map((gold) => [gold.itemId, gold]));
const partitions = stratifiedPartition(items);
const partitionByItem = new Map(
  partitions.assignments.map(({ itemId, partition }) => [itemId, partition]),
);
const observationsFor = (thresholdId) =>
  items.flatMap((item) => {
    const gold = goldByItem.get(item.itemId);
    const prediction = item.hiddenPrediction?.calibrationScores?.[thresholdId];
    if (
      !gold ||
      typeof prediction !== "number" ||
      partitionByItem.get(item.itemId) !== "calibration"
    )
      return [];
    return [
      {
        score: prediction,
        expectedPositive: gold.finalLabelIds.some((label) =>
          ["accepted", "same-event", "supported", "equivalent", "sector-wide"].some((token) =>
            label.includes(token),
          ),
        ),
        critical: item.difficultyClass === "adversarial",
      },
    ];
  });
const evaluate = (observations, threshold) => {
  const accepted = observations.filter(({ score }) => score >= threshold);
  const truePositive = accepted.filter(({ expectedPositive }) => expectedPositive).length;
  const falsePositive = accepted.length - truePositive;
  const positiveCount = observations.filter(({ expectedPositive }) => expectedPositive).length;
  return {
    threshold,
    precision: accepted.length ? truePositive / accepted.length : 1,
    recall: positiveCount ? truePositive / positiveCount : 1,
    criticalFailures: accepted.filter(
      ({ expectedPositive, critical }) => !expectedPositive && critical,
    ).length,
    falsePositive,
  };
};
const results = thresholdDefinitions.map(([thresholdId, oldThreshold, candidates, objective]) => {
  const observations = observationsFor(thresholdId);
  const alternatives = candidates.map((threshold) => evaluate(observations, threshold));
  const chosen = observations.length
    ? [...alternatives]
        .filter(({ criticalFailures }) => criticalFailures === 0)
        .sort(
          (left, right) =>
            right.precision - left.precision ||
            right.recall - left.recall ||
            right.threshold - left.threshold,
        )[0]
    : null;
  return {
    calibrationVersion: "calibration-v1",
    thresholdId,
    trainingCorpusVersion: "gold-corpus-v1:training",
    calibrationCorpusVersion: "gold-corpus-v1:calibration",
    heldOutCorpusVersion: "gold-corpus-v1:held-out-untouched",
    objective,
    oldThreshold,
    chosenThreshold: chosen?.threshold ?? null,
    alternatives: observations.length
      ? alternatives
      : candidates.map((threshold) => ({
          threshold,
          precision: null,
          recall: null,
          criticalFailures: null,
        })),
    metrics: {
      observations: observations.length,
      precision: chosen?.precision ?? null,
      recall: chosen?.recall ?? null,
      criticalFailures: chosen?.criticalFailures ?? null,
    },
    tradeoffs: [
      "Critical precision ranks before recall.",
      "More uncertain records may route to review.",
      "Held-out approval is required before a threshold can replace a configured value.",
    ],
    approvalStatus: chosen ? "proposed" : "blocked_pending_human_review",
    automaticallyApplied: false,
    blockingReasons: chosen
      ? ["HELD_OUT_APPROVAL_REQUIRED"]
      : ["NO_ADJUDICATED_CALIBRATION_OBSERVATIONS", "HELD_OUT_EVALUATION_NOT_AVAILABLE"],
  };
});
const proposed = results.filter(({ chosenThreshold }) => chosenThreshold !== null);

writeReport({
  slug: "threshold-calibration",
  title: "Threshold calibration summary",
  status: proposed.length ? "PROPOSED_AWAITING_HELD_OUT_APPROVAL" : "BLOCKED_PENDING_HUMAN_REVIEW",
  summary: proposed.length
    ? "Calibration-partition observations produced proposals; configured thresholds remain unchanged pending held-out approval."
    : "calibration-v1 is defined, but no threshold changes are proposed without adjudicated calibration labels and recorded pipeline scores.",
  metrics: {
    thresholdCount: results.length,
    adjudicatedGoldLabels: goldLabels.length,
    calibrationObservations: results.reduce((sum, result) => sum + result.metrics.observations, 0),
    proposedThresholdChanges: proposed.length,
    automaticallyAppliedChanges: 0,
    heldOutCriticalFailures: null,
  },
  gates: {
    noUnreviewedThresholdChanges: results.every(
      ({ automaticallyApplied }) => !automaticallyApplied,
    ),
    heldOutRemainsUntouched: true,
    deterministicCalibrationVersion: true,
    criticalPrecisionPrioritized: true,
  },
  blockers: proposed.length
    ? ["Held-out evaluation and approval are required before threshold adoption."]
    : [
        "Human-reviewed calibration labels and matching pipeline scores do not yet exist.",
        "Held-out scoring cannot occur before labels are finalized.",
      ],
  details: { calibrationVersion: "calibration-v1", partitionCounts: partitions.counts, results },
});
