import type { EventSignature } from "../schemas/event-signature";

function overlap(left: readonly string[], right: readonly string[]): number {
  const rightSet = new Set(right);
  return left.filter((item) => rightSet.has(item)).length;
}

export interface EventSimilarity {
  score: number;
  explanationCodes: string[];
}

export function scoreEventSimilarity(left: EventSignature, right: EventSignature): EventSimilarity {
  let score = 0;
  const explanationCodes: string[] = [];
  if (left.eventType === right.eventType) {
    score += 0.25;
    explanationCodes.push("EVENT_TYPE_MATCH");
  }
  if (overlap(left.primaryEntityIds, right.primaryEntityIds)) {
    score += 0.2;
    explanationCodes.push("PRIMARY_ENTITY_OVERLAP");
  }
  if (left.action.toLowerCase() === right.action.toLowerCase()) {
    score += 0.2;
    explanationCodes.push("EVENT_ACTION_MATCH");
  }
  if (left.policyOrFilingId && left.policyOrFilingId === right.policyOrFilingId) {
    score += 0.25;
    explanationCodes.push("POLICY_OR_FILING_ID_MATCH");
  }
  if (left.effectiveDate && left.effectiveDate === right.effectiveDate) {
    score += 0.1;
    explanationCodes.push("EFFECTIVE_DATE_MATCH");
  }
  if (left.productOrBusinessLine && left.productOrBusinessLine === right.productOrBusinessLine) {
    score += 0.1;
    explanationCodes.push("BUSINESS_LINE_MATCH");
  }
  if (left.geography && right.geography && left.geography !== right.geography) {
    score -= 0.15;
    explanationCodes.push("GEOGRAPHY_DIFFERS");
  }
  return { score: Math.max(0, Math.min(1, score)), explanationCodes };
}
