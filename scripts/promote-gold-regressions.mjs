import { loadCorpus, writeReport } from "./lib/gold-corpus-evaluation.mjs";

const { items, goldLabels, adjudications } = loadCorpus();
const adjudicationIds = new Set(adjudications.map(({ adjudicationId }) => adjudicationId));
const eligible = items.filter(
  (item) =>
    item.finalStatus === "gold" &&
    item.finalGoldLabelId &&
    item.adjudicationDecisionId &&
    adjudicationIds.has(item.adjudicationDecisionId) &&
    item.copyrightClassification !== "metadata_only",
);
writeReport({
  slug: "regression-promotion",
  title: "Regression promotion summary",
  status: eligible.length ? "CANDIDATES_AVAILABLE" : "BLOCKED_PENDING_HUMAN_REVIEW",
  summary:
    "No candidate is promoted until its human gold label, adjudication, provenance, and fixture-use classification are complete.",
  metrics: {
    corpusItems: items.length,
    goldLabels: goldLabels.length,
    eligibleForPromotion: eligible.length,
    promoted: 0,
    blocked: items.length - eligible.length,
  },
  gates: {
    noUngoldedPromotion: eligible.every(({ finalGoldLabelId }) => finalGoldLabelId !== null),
    noUnadjudicatedPromotion: eligible.every(
      ({ adjudicationDecisionId }) => adjudicationDecisionId !== null,
    ),
    noAutomaticPromotion: true,
  },
  blockers: ["Human gold labels and adjudications are pending."],
});
