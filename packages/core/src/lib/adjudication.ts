import type { Adjudication } from "../schemas/adjudication";
import type { AnnotationItem } from "../schemas/annotation-item";
import type { ReviewerDecision } from "../schemas/reviewer-decision";
import { routeAdjudication } from "./adjudication-routing";

export function validateAdjudication(
  item: AnnotationItem,
  decisions: readonly ReviewerDecision[],
  adjudication: Adjudication,
) {
  const independentReviewers = new Set(decisions.map(({ reviewerId }) => reviewerId));
  const route = routeAdjudication(item, decisions);
  const errors = [
    ...(independentReviewers.size < 2 ? ["TWO_INDEPENDENT_REVIEWS_REQUIRED"] : []),
    ...(adjudication.itemId !== item.itemId ? ["ITEM_MISMATCH"] : []),
    ...(adjudication.task !== item.task ? ["TASK_MISMATCH"] : []),
    ...(decisions.some((decision) => decision.itemId !== item.itemId)
      ? ["FOREIGN_REVIEWER_DECISION"]
      : []),
    ...(decisions.some((decision) => decision.reviewerId === adjudication.adjudicatorId)
      ? ["ADJUDICATOR_MUST_BE_INDEPENDENT"]
      : []),
    ...(adjudication.reviewerDecisionIds.some(
      (id) => !decisions.some((decision) => decision.decisionId === id),
    )
      ? ["UNKNOWN_REVIEWER_DECISION"]
      : []),
    ...(!adjudication.evidenceCited.length ? ["ADJUDICATION_EVIDENCE_REQUIRED"] : []),
  ];
  return { accepted: errors.length === 0, errors, route };
}
