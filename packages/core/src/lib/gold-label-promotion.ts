import type { Adjudication } from "../schemas/adjudication";
import type { AnnotationItem } from "../schemas/annotation-item";
import type { GoldLabel } from "../schemas/gold-label";
import type { ReviewerDecision } from "../schemas/reviewer-decision";
import { validateAdjudication } from "./adjudication";

export function promoteGoldLabel(
  item: AnnotationItem,
  decisions: readonly ReviewerDecision[],
  adjudication: Adjudication,
): GoldLabel {
  const validation = validateAdjudication(item, decisions, adjudication);
  if (!validation.accepted || adjudication.unresolved) {
    throw new Error(
      `Gold promotion blocked: ${[...validation.errors, ...(adjudication.unresolved ? ["UNRESOLVED"] : [])].join(",")}`,
    );
  }
  return {
    goldLabelId: `gold-label-${item.itemId.replace("gold-item-", "")}`,
    itemId: item.itemId,
    corpusVersion: item.corpusVersion,
    task: item.task,
    finalLabelIds: adjudication.finalLabelIds,
    adjudicationId: adjudication.adjudicationId,
    independentReviewerDecisionIds: [
      ...new Map(decisions.map((decision) => [decision.reviewerId, decision.decisionId])).values(),
    ],
    confidence: adjudication.confidence,
    provenance: item.provenance,
    finalizedAt: adjudication.adjudicatedAt,
    finalizedBy: adjudication.adjudicatorId,
    amendments: [],
    status: "final",
  };
}

export function amendGoldLabel(
  prior: GoldLabel,
  replacementLabelIds: readonly string[],
  reason: string,
  amendedBy: string,
  amendedAt: string,
  priorDecisionChecksum: string,
): GoldLabel {
  if (!reason.trim()) throw new Error("A gold-label amendment reason is required");
  if (prior.status === "withdrawn") throw new Error("A withdrawn gold label cannot be amended");
  const amendmentNumber = prior.amendments.length + 1;
  return {
    ...prior,
    goldLabelId: `${prior.goldLabelId}-amendment-${amendmentNumber}`,
    finalLabelIds: [...replacementLabelIds],
    finalizedAt: amendedAt,
    finalizedBy: amendedBy,
    amendments: [
      ...prior.amendments,
      {
        amendmentId: `amendment-${prior.goldLabelId}-${amendmentNumber}`,
        priorDecisionChecksum,
        priorLabelIds: [...prior.finalLabelIds],
        replacementLabelIds: [...replacementLabelIds],
        reason,
        amendedBy,
        amendedAt,
      },
    ],
    status: "amended",
  };
}
