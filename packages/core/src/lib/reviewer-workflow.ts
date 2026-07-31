import type { AnnotationItem } from "../schemas/annotation-item";
import type { ReviewerDecision } from "../schemas/reviewer-decision";

export function getReviewerWorkflowState(
  item: AnnotationItem,
  decisions: readonly ReviewerDecision[],
) {
  const itemDecisions = decisions.filter(
    (decision) => decision.itemId === item.itemId && decision.status !== "withdrawn",
  );
  const independentReviewers = new Set(itemDecisions.map(({ reviewerId }) => reviewerId));
  const lowConfidence = itemDecisions.some(({ confidence }) => confidence === "low");
  const cannotDetermine = itemDecisions.some((decision) => decision.cannotDetermine);
  const signatures = new Set(
    itemDecisions.map((decision) => [...decision.selectedLabelIds].sort().join("|")),
  );
  const disagreement = signatures.size > 1;
  const reviewComplete = independentReviewers.size >= item.expectedReviewCount;
  return {
    independentReviewCount: independentReviewers.size,
    reviewComplete,
    adjudicationRequired: reviewComplete && (disagreement || lowConfidence || cannotDetermine),
    goldPromotionEligible: reviewComplete && !disagreement && !lowConfidence && !cannotDetermine,
    explanationCodes: [
      ...(disagreement ? ["REVIEWER_DISAGREEMENT"] : []),
      ...(lowConfidence ? ["LOW_REVIEWER_CONFIDENCE"] : []),
      ...(cannotDetermine ? ["CANNOT_DETERMINE_SELECTED"] : []),
      ...(!reviewComplete ? ["INDEPENDENT_REVIEW_COUNT_INCOMPLETE"] : []),
    ],
  };
}
