import type { AnnotationItem } from "../schemas/annotation-item";
import type { GoldLabel } from "../schemas/gold-label";
import type { ReviewerDecision } from "../schemas/reviewer-decision";
import {
  cohensKappa,
  confusionMatrix,
  fleissKappa,
  precisionRecallForLabel,
  rawAgreement,
  weightedKappa,
} from "./agreement-metrics";

export function decisionLabelSignature(decision: ReviewerDecision): string {
  if (decision.cannotDetermine) return "cannot_determine";
  if (decision.insufficientEvidence) return "insufficient_evidence";
  return [...decision.selectedLabelIds].sort().join("|");
}

export function evaluateReviewerPair(decisions: readonly ReviewerDecision[]) {
  const byItem = new Map<string, ReviewerDecision[]>();
  for (const decision of decisions)
    byItem.set(decision.itemId, [...(byItem.get(decision.itemId) ?? []), decision]);
  const paired = [...byItem.values()].filter((itemDecisions) => itemDecisions.length === 2);
  const left = paired.map((itemDecisions) => {
    const first = itemDecisions[0]!;
    return decisionLabelSignature(first);
  });
  const right = paired.map((itemDecisions) => {
    const second = itemDecisions[1]!;
    return decisionLabelSignature(second);
  });
  return {
    itemCount: paired.length,
    rawAgreement: rawAgreement(left, right),
    cohensKappa: cohensKappa(left, right),
    cannotDetermineRate: decisions.length
      ? decisions.filter(({ cannotDetermine }) => cannotDetermine).length / decisions.length
      : null,
    confidenceDistribution: {
      low: decisions.filter(({ confidence }) => confidence === "low").length,
      medium: decisions.filter(({ confidence }) => confidence === "medium").length,
      high: decisions.filter(({ confidence }) => confidence === "high").length,
    },
  };
}

interface PairObservation {
  item: AnnotationItem;
  reviewerPair: string;
  left: string;
  right: string;
}

function summarizePairs(observations: readonly PairObservation[]) {
  const left = observations.map((observation) => observation.left);
  const right = observations.map((observation) => observation.right);
  return {
    itemCount: observations.length,
    rawAgreement: rawAgreement(left, right),
    cohensKappa: cohensKappa(left, right),
  };
}

export function evaluateAgreementReport(
  items: readonly AnnotationItem[],
  decisions: readonly ReviewerDecision[],
  goldLabels: readonly GoldLabel[] = [],
  orderedRanks: Readonly<Record<string, number>> = {},
) {
  const itemById = new Map(items.map((item) => [item.itemId, item]));
  const decisionsByItem = new Map<string, ReviewerDecision[]>();
  for (const decision of decisions) {
    if (decision.status === "withdrawn") continue;
    decisionsByItem.set(decision.itemId, [
      ...(decisionsByItem.get(decision.itemId) ?? []).filter(
        (existing) => existing.reviewerId !== decision.reviewerId,
      ),
      decision,
    ]);
  }
  const pairObservations: PairObservation[] = [];
  for (const [itemId, itemDecisions] of decisionsByItem) {
    const item = itemById.get(itemId);
    if (!item) continue;
    const ordered = [...itemDecisions].sort((a, b) => a.reviewerId.localeCompare(b.reviewerId));
    for (let leftIndex = 0; leftIndex < ordered.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < ordered.length; rightIndex += 1) {
        const leftDecision = ordered[leftIndex]!;
        const rightDecision = ordered[rightIndex]!;
        pairObservations.push({
          item,
          reviewerPair: `${leftDecision.reviewerId}::${rightDecision.reviewerId}`,
          left: decisionLabelSignature(leftDecision),
          right: decisionLabelSignature(rightDecision),
        });
      }
    }
  }
  const group = (
    keyFor: (observation: PairObservation) => string,
  ): Record<string, ReturnType<typeof summarizePairs>> => {
    const grouped = new Map<string, PairObservation[]>();
    for (const observation of pairObservations) {
      const key = keyFor(observation);
      grouped.set(key, [...(grouped.get(key) ?? []), observation]);
    }
    return Object.fromEntries(
      [...grouped]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, values]) => [key, summarizePairs(values)]),
    );
  };

  const categories = [
    ...new Set(decisions.map((decision) => decisionLabelSignature(decision))),
  ].sort();
  const fleissRows = [...decisionsByItem.values()]
    .filter((itemDecisions) => itemDecisions.length >= 3)
    .map((itemDecisions) =>
      categories.map(
        (category) =>
          itemDecisions.filter((decision) => decisionLabelSignature(decision) === category).length,
      ),
    );
  const orderedPairs = pairObservations.filter(
    ({ left, right }) => orderedRanks[left] !== undefined && orderedRanks[right] !== undefined,
  );
  const goldByItem = new Map(
    goldLabels
      .filter((gold) => gold.status !== "withdrawn")
      .map((gold) => [gold.itemId, [...gold.finalLabelIds].sort().join("|")]),
  );
  const goldComparisons = decisions.flatMap((decision) => {
    const expected = goldByItem.get(decision.itemId);
    return expected === undefined
      ? []
      : [{ expected, actual: decisionLabelSignature(decision), reviewerId: decision.reviewerId }];
  });
  const expected = goldComparisons.map((comparison) => comparison.expected);
  const actual = goldComparisons.map((comparison) => comparison.actual);
  const labelMetrics = Object.fromEntries(
    [...new Set(expected)].map((label) => [
      label,
      precisionRecallForLabel(expected, actual, label),
    ]),
  );
  return {
    reviewedItemCount: decisionsByItem.size,
    pairObservationCount: pairObservations.length,
    overall: summarizePairs(pairObservations),
    fleissKappa: fleissKappa(fleissRows),
    weightedKappa: weightedKappa(
      orderedPairs.map(({ left }) => orderedRanks[left]!),
      orderedPairs.map(({ right }) => orderedRanks[right]!),
      Math.max(0, ...Object.values(orderedRanks)),
    ),
    cannotDetermineRate: decisions.length
      ? decisions.filter((decision) => decision.cannotDetermine).length / decisions.length
      : null,
    insufficientEvidenceRate: decisions.length
      ? decisions.filter((decision) => decision.insufficientEvidence).length / decisions.length
      : null,
    reviewRequiredRate: decisions.length
      ? decisions.filter((decision) =>
          decision.selectedLabelIds.some((label) => label.endsWith("review-required")),
        ).length / decisions.length
      : null,
    confidenceDistribution: {
      low: decisions.filter(({ confidence }) => confidence === "low").length,
      medium: decisions.filter(({ confidence }) => confidence === "medium").length,
      high: decisions.filter(({ confidence }) => confidence === "high").length,
    },
    byTask: group(({ item }) => item.task),
    byDifficulty: group(({ item }) => item.difficultyClass),
    bySourceCategory: group(({ item }) => item.sourceCategory),
    byEvidenceDepth: group(({ item }) => item.evidenceDepth),
    bySector: group(({ item }) => item.sectorId),
    byReviewerPair: group(({ reviewerPair }) => reviewerPair),
    againstGold: {
      comparisonCount: goldComparisons.length,
      confusionMatrix: confusionMatrix(expected, actual),
      labelMetrics,
    },
  };
}
