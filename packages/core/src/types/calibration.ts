import type { AnnotationItem } from "../schemas/annotation-item";
import type { ReviewerDecision } from "../schemas/reviewer-decision";

export interface BlindedAnnotationItem extends Omit<
  AnnotationItem,
  | "hiddenPrediction"
  | "reviewAssignmentIds"
  | "reviewerDecisionIds"
  | "reviewerNotes"
  | "adjudicationDecisionId"
  | "finalGoldLabelId"
  | "goldLabelConfidence"
  | "adjudicatorNotes"
  | "amendmentHistory"
  | "regressionFixtureStatus"
> {
  blinding: {
    predictionHidden: true;
    peerDecisionsHidden: true;
    adjudicationHidden: true;
  };
}

export interface AgreementObservation {
  itemId: string;
  decisions: ReviewerDecision[];
}
