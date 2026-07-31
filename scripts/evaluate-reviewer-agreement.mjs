import { loadCorpus, writeReport } from "./lib/gold-corpus-evaluation.mjs";

const { items, decisions, adjudications, goldLabels } = loadCorpus();
const itemById = new Map(items.map((item) => [item.itemId, item]));
const signature = (decision) =>
  decision.cannotDetermine
    ? "cannot_determine"
    : decision.insufficientEvidence
      ? "insufficient_evidence"
      : [...decision.selectedLabelIds].sort().join("|");
const currentByItem = new Map();
for (const decision of decisions.filter(({ status }) => status !== "withdrawn")) {
  const current = currentByItem.get(decision.itemId) ?? new Map();
  current.set(decision.reviewerId, decision);
  currentByItem.set(decision.itemId, current);
}
const pairs = [];
for (const [itemId, reviewerMap] of currentByItem) {
  const item = itemById.get(itemId);
  if (!item) continue;
  const ordered = [...reviewerMap.values()].sort((left, right) =>
    left.reviewerId.localeCompare(right.reviewerId),
  );
  for (let left = 0; left < ordered.length; left += 1) {
    for (let right = left + 1; right < ordered.length; right += 1) {
      pairs.push({
        item,
        reviewerPair: `${ordered[left].reviewerId}::${ordered[right].reviewerId}`,
        left: signature(ordered[left]),
        right: signature(ordered[right]),
      });
    }
  }
}
const rawAgreement = (observations) =>
  observations.length
    ? observations.filter(({ left, right }) => left === right).length / observations.length
    : null;
const cohensKappa = (observations) => {
  if (!observations.length) return null;
  const labels = [...new Set(observations.flatMap(({ left, right }) => [left, right]))];
  const observed = rawAgreement(observations);
  const expected = labels.reduce(
    (sum, label) =>
      sum +
      (observations.filter(({ left }) => left === label).length / observations.length) *
        (observations.filter(({ right }) => right === label).length / observations.length),
    0,
  );
  return expected === 1 ? (observed === 1 ? 1 : null) : (observed - expected) / (1 - expected);
};
const fleissKappa = () => {
  const eligible = [...currentByItem.values()].filter((reviewers) => reviewers.size >= 3);
  if (!eligible.length || new Set(eligible.map((reviewers) => reviewers.size)).size !== 1)
    return null;
  const categories = [
    ...new Set(eligible.flatMap((reviewers) => [...reviewers.values()].map(signature))),
  ];
  const ratingsPerItem = eligible[0].size;
  const rows = eligible.map((reviewers) =>
    categories.map(
      (category) =>
        [...reviewers.values()].filter((decision) => signature(decision) === category).length,
    ),
  );
  const totals = categories.map((_, categoryIndex) =>
    rows.reduce((sum, row) => sum + row[categoryIndex], 0),
  );
  const proportions = totals.map((total) => total / (rows.length * ratingsPerItem));
  const expected = proportions.reduce((sum, proportion) => sum + proportion ** 2, 0);
  const observed =
    rows.reduce(
      (sum, row) =>
        sum +
        (row.reduce((inner, count) => inner + count ** 2, 0) - ratingsPerItem) /
          (ratingsPerItem * (ratingsPerItem - 1)),
      0,
    ) / rows.length;
  return expected === 1 ? (observed === 1 ? 1 : null) : (observed - expected) / (1 - expected);
};
const summarize = (observations) => ({
  itemPairs: observations.length,
  rawAgreement: rawAgreement(observations),
  cohensKappa: cohensKappa(observations),
});
const groupBy = (keyFor) => {
  const groups = new Map();
  for (const pair of pairs) {
    const key = keyFor(pair);
    groups.set(key, [...(groups.get(key) ?? []), pair]);
  }
  return Object.fromEntries(
    [...groups]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, values]) => [key, summarize(values)]),
  );
};
const disagreementItemIds = [...currentByItem]
  .filter(([, reviewers]) => new Set([...reviewers.values()].map(signature)).size > 1)
  .map(([itemId]) => itemId);
const adjudicatedIds = new Set(adjudications.map(({ itemId }) => itemId));
const explicitlyUnresolvedIds = new Set(
  adjudications.filter(({ unresolved }) => unresolved).map(({ itemId }) => itemId),
);
const untrackedDisagreements = disagreementItemIds.filter(
  (itemId) => !adjudicatedIds.has(itemId) && !explicitlyUnresolvedIds.has(itemId),
);
const objectiveBinaryTasks = new Set(["source_normalization", "claims", "review_routing"]);
const objectivePairs = pairs.filter(({ item }) => objectiveBinaryTasks.has(item.task));
const overall = summarize(pairs);
const objectiveRaw = rawAgreement(objectivePairs);
const fabricatedValues = decisions.filter(({ reviewerId }) =>
  reviewerId.startsWith("system-"),
).length;
const reviewRequiredRate = decisions.length
  ? decisions.filter((decision) =>
      decision.selectedLabelIds.some((label) => label.includes("review-required")),
    ).length / decisions.length
  : null;
const goldByItem = new Map(
  goldLabels
    .filter(({ status: goldStatus }) => goldStatus !== "withdrawn")
    .map((gold) => [gold.itemId, [...gold.finalLabelIds].sort().join("|")]),
);
const goldComparisons = decisions.flatMap((decision) => {
  const expected = goldByItem.get(decision.itemId);
  return expected ? [{ expected, actual: signature(decision) }] : [];
});
const comparisonLabels = [
  ...new Set(goldComparisons.flatMap(({ expected, actual }) => [expected, actual])),
].sort();
const confusion = Object.fromEntries(
  comparisonLabels.map((expected) => [
    expected,
    Object.fromEntries(comparisonLabels.map((actual) => [actual, 0])),
  ]),
);
for (const comparison of goldComparisons) confusion[comparison.expected][comparison.actual] += 1;
const precisionRecallByLabel = Object.fromEntries(
  comparisonLabels.map((label) => {
    const truePositive = goldComparisons.filter(
      ({ expected, actual }) => expected === label && actual === label,
    ).length;
    const falsePositive = goldComparisons.filter(
      ({ expected, actual }) => expected !== label && actual === label,
    ).length;
    const falseNegative = goldComparisons.filter(
      ({ expected, actual }) => expected === label && actual !== label,
    ).length;
    return [
      label,
      {
        precision:
          truePositive + falsePositive ? truePositive / (truePositive + falsePositive) : null,
        recall: truePositive + falseNegative ? truePositive / (truePositive + falseNegative) : null,
        truePositive,
        falsePositive,
        falseNegative,
      },
    ];
  }),
);
const status = pairs.length
  ? (objectiveRaw === null || objectiveRaw >= 0.85) &&
    (overall.cohensKappa === null || overall.cohensKappa >= 0.7) &&
    untrackedDisagreements.length === 0
    ? "AGREEMENT_GATES_PASS"
    : "AGREEMENT_REVIEW_REQUIRED"
  : "BLOCKED_PENDING_HUMAN_REVIEW";

writeReport({
  slug: "reviewer-agreement",
  title: "Reviewer agreement summary",
  status,
  summary: pairs.length
    ? "Agreement is calculated from current independent human decisions and remains disaggregated."
    : "Agreement is intentionally not calculated until at least two independent human decisions exist for candidate items.",
  metrics: {
    reviewerDecisions: decisions.length,
    reviewedItems: currentByItem.size,
    reviewerPairs: pairs.length,
    adjudications: adjudications.length,
    rawAgreement: overall.rawAgreement,
    objectiveBinaryRawAgreement: objectiveRaw,
    cohensKappa: overall.cohensKappa,
    fleissKappa: fleissKappa(),
    weightedKappa: null,
    cannotDetermineRate: decisions.length
      ? decisions.filter(({ cannotDetermine }) => cannotDetermine).length / decisions.length
      : null,
    reviewRequiredRate,
    fabricatedAgreementValues: fabricatedValues,
    goldLabels: goldLabels.length,
  },
  gates: {
    noFabricatedAgreement: fabricatedValues === 0,
    noSingleReviewGold: goldLabels.every(
      ({ independentReviewerDecisionIds }) => independentReviewerDecisionIds.length >= 2,
    ),
    noUntrackedReviewerDisagreements: untrackedDisagreements.length === 0,
    objectiveBinaryGateMetOrPending: objectiveRaw === null || objectiveRaw >= 0.85,
    categoricalKappaGateMetOrPending: overall.cohensKappa === null || overall.cohensKappa >= 0.7,
    pendingStateReportedHonestly: decisions.length > 0 || pairs.length === 0,
  },
  blockers: pairs.length
    ? []
    : [
        "Two independent human reviews per candidate are required before agreement metrics can be reported.",
      ],
  details: {
    byTask: groupBy(({ item }) => item.task),
    byDifficulty: groupBy(({ item }) => item.difficultyClass),
    bySourceCategory: groupBy(({ item }) => item.sourceCategory),
    byEvidenceDepth: groupBy(({ item }) => item.evidenceDepth),
    bySector: groupBy(({ item }) => item.sectorId),
    byReviewerPair: groupBy(({ reviewerPair }) => reviewerPair),
    disagreementItemIds,
    untrackedDisagreements,
    confidenceDistribution: {
      low: decisions.filter(({ confidence }) => confidence === "low").length,
      medium: decisions.filter(({ confidence }) => confidence === "medium").length,
      high: decisions.filter(({ confidence }) => confidence === "high").length,
    },
    againstAdjudicatedGold: {
      status: goldLabels.length ? "available" : "not_measurable",
      comparisonCount: goldComparisons.length,
      precisionRecallByLabel,
      confusionMatrix: confusion,
    },
    weightedKappaApplicability:
      "No ordered gold label family is configured in annotation-v1; weighted kappa is not mathematically applicable until ordered ranks exist.",
  },
});
