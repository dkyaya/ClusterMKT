import type { ReviewerAssignment } from "../schemas/reviewer-assignment";
import type { ReviewerDecision } from "../schemas/reviewer-decision";

export function validateReviewerSubmission(
  assignment: ReviewerAssignment,
  decision: ReviewerDecision,
  priorDecisions: readonly ReviewerDecision[],
): { accepted: boolean; explanationCodes: string[] } {
  const codes: string[] = [];
  if (assignment.status !== "assigned") codes.push("ASSIGNMENT_NOT_OPEN");
  if (decision.assignmentId !== assignment.assignmentId) codes.push("ASSIGNMENT_MISMATCH");
  if (decision.itemId !== assignment.itemId) codes.push("ITEM_MISMATCH");
  if (decision.task !== assignment.task) codes.push("TASK_MISMATCH");
  if (decision.reviewerId !== assignment.reviewerId) codes.push("REVIEWER_MISMATCH");
  if (priorDecisions.some((prior) => prior.assignmentId === assignment.assignmentId)) {
    codes.push("DUPLICATE_REVIEWER_SUBMISSION");
  }
  if (
    !decision.cannotDetermine &&
    !decision.insufficientEvidence &&
    decision.selectedLabelIds.length === 0
  ) {
    codes.push("LABEL_REQUIRED");
  }
  if (decision.cannotDetermine && decision.insufficientEvidence) {
    codes.push("MUTUALLY_EXCLUSIVE_ABSTENTION_OPTIONS");
  }
  if (
    (decision.cannotDetermine || decision.insufficientEvidence) &&
    decision.selectedLabelIds.length
  ) {
    codes.push("ABSTENTION_CANNOT_INCLUDE_LABEL");
  }
  if (
    (decision.cannotDetermine || decision.insufficientEvidence || decision.confidence === "low") &&
    decision.notes.trim().length === 0
  ) {
    codes.push("NOTES_REQUIRED_FOR_ESCALATION");
  }
  if (
    decision.predictionVisibleAtSubmission ||
    decision.peerDecisionsVisibleAtSubmission ||
    decision.adjudicationVisibleAtSubmission
  ) {
    codes.push("BLINDING_VIOLATION");
  }
  return {
    accepted: codes.length === 0,
    explanationCodes: codes.length ? codes : ["SUBMISSION_ACCEPTED"],
  };
}

export function appendDecisionAmendment(
  prior: ReviewerDecision,
  replacementLabelIds: readonly string[],
  reason: string,
  amendedBy: string,
  amendedAt: string,
  priorDecisionChecksum: string,
): ReviewerDecision {
  if (!reason.trim()) throw new Error("An amendment reason is required");
  if (prior.status === "withdrawn") throw new Error("A withdrawn decision cannot be amended");
  const amendmentNumber = prior.amendments.length + 1;
  return {
    ...prior,
    decisionId: `${prior.decisionId}-amendment-${amendmentNumber}`,
    selectedLabelIds: [...replacementLabelIds],
    submittedAt: amendedAt,
    amendments: [
      ...prior.amendments,
      {
        amendmentId: `amendment-${prior.decisionId}-${amendmentNumber}`,
        priorDecisionChecksum,
        priorLabelIds: [...prior.selectedLabelIds],
        replacementLabelIds: [...replacementLabelIds],
        reason,
        amendedBy,
        amendedAt,
      },
    ],
    status: "amended",
  };
}
