import type { EventSignature } from "../schemas/event-signature";
import { scoreEventSimilarity } from "./event-similarity";

export type EventRelationship =
  | "same_event"
  | "updated_same_event"
  | "related_distinct_event"
  | "different_event"
  | "review_required";

export interface EventBoundaryDecision {
  relationship: EventRelationship;
  score: number;
  explanationCodes: string[];
  reviewRequired: boolean;
}

export function decideEventBoundary(
  left: EventSignature,
  right: EventSignature,
): EventBoundaryDecision {
  const similarity = scoreEventSimilarity(left, right);
  const samePolicy = Boolean(
    left.policyOrFilingId && left.policyOrFilingId === right.policyOrFilingId,
  );
  const proposalFinal =
    /propos/.test(left.action.toLowerCase()) !== /propos/.test(right.action.toLowerCase()) &&
    /final|adopt|effective/.test(`${left.action} ${right.action}`.toLowerCase());
  const rumorConfirmation =
    /rumor/.test(`${left.action} ${right.action}`.toLowerCase()) &&
    /confirm/.test(`${left.action} ${right.action}`.toLowerCase());
  const decisionSpeech =
    /decision/.test(`${left.action} ${right.action}`.toLowerCase()) &&
    /speech/.test(`${left.action} ${right.action}`.toLowerCase());
  if (proposalFinal)
    return {
      relationship: "related_distinct_event",
      score: similarity.score,
      explanationCodes: [...similarity.explanationCodes, "PROPOSAL_AND_FINAL_RULE_DISTINCT"],
      reviewRequired: false,
    };
  if (rumorConfirmation)
    return {
      relationship: "related_distinct_event",
      score: similarity.score,
      explanationCodes: [...similarity.explanationCodes, "RUMOR_CONFIRMATION_DISTINCT_CLAIM_STATE"],
      reviewRequired: false,
    };
  if (decisionSpeech)
    return {
      relationship: "different_event",
      score: similarity.score,
      explanationCodes: [...similarity.explanationCodes, "DECISION_AND_LATER_SPEECH_DISTINCT"],
      reviewRequired: false,
    };
  if (left.eventType !== right.eventType)
    return {
      relationship: "related_distinct_event",
      score: similarity.score,
      explanationCodes: [...similarity.explanationCodes, "EVENT_TYPE_DIFFERS"],
      reviewRequired: false,
    };
  if (left.geography && right.geography && left.geography !== right.geography)
    return {
      relationship: "different_event",
      score: similarity.score,
      explanationCodes: [...similarity.explanationCodes, "GEOGRAPHY_DIFFERS"],
      reviewRequired: false,
    };
  if (
    left.quantitativeAnchors.length &&
    right.quantitativeAnchors.length &&
    left.quantitativeAnchors.join("|") !== right.quantitativeAnchors.join("|")
  )
    return {
      relationship: "different_event",
      score: similarity.score,
      explanationCodes: [...similarity.explanationCodes, "QUANTITATIVE_PERIOD_DIFFERS"],
      reviewRequired: false,
    };
  if (left.effectiveDate && right.effectiveDate && left.effectiveDate !== right.effectiveDate)
    return {
      relationship: "review_required",
      score: similarity.score,
      explanationCodes: [...similarity.explanationCodes, "EFFECTIVE_DATE_DIFFERS"],
      reviewRequired: true,
    };
  if (/correct/.test(`${left.action} ${right.action}`.toLowerCase()) && similarity.score >= 0.4)
    return {
      relationship: "updated_same_event",
      score: similarity.score,
      explanationCodes: [...similarity.explanationCodes, "CORRECTION_LINKED_TO_RELEASE"],
      reviewRequired: false,
    };
  if (samePolicy || similarity.score >= 0.8)
    return {
      relationship: "same_event",
      score: similarity.score,
      explanationCodes: [...similarity.explanationCodes, "EVENT_BREADTH_SUPPORTS_MERGE"],
      reviewRequired: false,
    };
  if (similarity.score >= 0.6)
    return {
      relationship: "updated_same_event",
      score: similarity.score,
      explanationCodes: [...similarity.explanationCodes, "EVENT_UPDATE_SIGNALS"],
      reviewRequired: false,
    };
  if (similarity.score >= 0.4)
    return {
      relationship: "review_required",
      score: similarity.score,
      explanationCodes: [...similarity.explanationCodes, "EVENT_BOUNDARY_AMBIGUOUS"],
      reviewRequired: true,
    };
  return {
    relationship: "different_event",
    score: similarity.score,
    explanationCodes: [...similarity.explanationCodes, "ENTITY_AND_DATE_NOT_SUFFICIENT"],
    reviewRequired: false,
  };
}
