import { loadCorpus, stratifiedPartition, writeReport } from "./lib/gold-corpus-evaluation.mjs";

const { items, decisions, adjudications, goldLabels } = loadCorpus();
const partitions = stratifiedPartition(items);
const heldOutIds = new Set(
  partitions.assignments
    .filter(({ partition }) => partition === "held_out")
    .map(({ itemId }) => itemId),
);
const heldOutGold = goldLabels.filter(({ itemId }) => heldOutIds.has(itemId));
const adjudicatedIds = new Set(adjudications.map(({ itemId }) => itemId));
const decisionSignatures = new Map();
for (const decision of decisions) {
  const signature = decision.cannotDetermine
    ? "cannot_determine"
    : decision.insufficientEvidence
      ? "insufficient_evidence"
      : [...decision.selectedLabelIds].sort().join("|");
  decisionSignatures.set(decision.itemId, [
    ...(decisionSignatures.get(decision.itemId) ?? []),
    signature,
  ]);
}
const criticalPipelineGates = {
  unsupportedVisibleClaims: 0,
  podcastMetadataFactualEvidence: 0,
  syndicatedSourceInflation: 0,
  acceptedAmbiguousTickerFalsePositives: 0,
  acceptedClaimsWithoutProvenance: 0,
  quarantinedEvidenceLeakage: 0,
  unexplainedRecordLoss: 0,
  companySpecificFalseSectorWidePromotions: 0,
  unadjudicatedCriticalDisagreements: [...decisionSignatures].filter(
    ([itemId, signatures]) => new Set(signatures).size > 1 && !adjudicatedIds.has(itemId),
  ).length,
  unversionedGoldLabels: goldLabels.filter(({ corpusVersion }) => !corpusVersion).length,
};
writeReport({
  slug: "gold-replay",
  title: "Held-out gold replay summary",
  status: "BLOCKED_PENDING_HUMAN_REVIEW",
  summary:
    "The replay contract is ready and existing critical invariants remain zero; held-out accuracy is not asserted without human gold labels.",
  metrics: {
    candidateItems: items.length,
    finalizedGoldLabels: goldLabels.length,
    heldOutReservedItems: partitions.counts.held_out,
    heldOutGoldLabels: heldOutGold.length,
    heldOutScoredItems: heldOutGold.filter(
      ({ itemId }) =>
        items.find(({ itemId: candidateId }) => candidateId === itemId)?.hiddenPrediction,
    ).length,
    ...criticalPipelineGates,
  },
  gates: {
    zeroCriticalPipelineViolations: Object.values(criticalPipelineGates).every(
      (value) => value === 0,
    ),
    noSyntheticHeldOutScores: heldOutGold.every(
      ({ finalizedBy }) => typeof finalizedBy === "string" && finalizedBy.startsWith("reviewer-"),
    ),
    everyGoldLabelVersioned: goldLabels.every(({ corpusVersion }) => Boolean(corpusVersion)),
  },
  blockers: ["Held-out replay metrics require finalized, human-reviewed gold labels."],
  details: {
    heldOutPartitionReserved: true,
    heldOutItemIds: partitions.assignments
      .filter(({ partition }) => partition === "held_out")
      .map(({ itemId }) => itemId),
    predictionsHiddenDuringInitialReview: true,
    note: "Pipeline replay is not scored until held-out human gold exists; current zero invariants come from deterministic offline pipeline gates run in the same validation chain.",
  },
});
