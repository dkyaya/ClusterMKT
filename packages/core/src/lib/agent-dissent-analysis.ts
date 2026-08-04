import type { AgentReviewDecision } from "../schemas/agent-review-decision";
import type { AgentDissent } from "../schemas/agent-dissent";
import type { AgentWorkerAssignment } from "./agent-worker-assignment";
import { stableFingerprint } from "./idempotency-key";

const CRITICAL_EXPLANATION_MARKERS = [
  "PROVENANCE",
  "EVENT_BOUNDARY",
  "QUANTITATIVE",
  "SAFETY",
  "FALSE_MATCH",
  "UNSUPPORTED_CLAIM",
];

export function detectAgentDissent(
  panelId: string,
  decisions: readonly AgentReviewDecision[],
  assignments: readonly AgentWorkerAssignment[],
  majorityLabelId: string | null,
  detectedAt: string,
): AgentDissent[] {
  const memberByReviewer = new Map(assignments.map((a) => [a.reviewerId, a.anonymizedMemberId]));
  return decisions
    .filter((decision) => decision.selectedLabelId !== majorityLabelId)
    .map((decision) => {
      const criticalReasonCodes = decision.explanationCodes.filter((code) =>
        CRITICAL_EXPLANATION_MARKERS.some((marker) => code.includes(marker)),
      );
      const isCritical =
        decision.confidence === "high" &&
        (criticalReasonCodes.length > 0 || decision.humanReviewRecommended);
      return {
        dissentId: `agent-dissent-${stableFingerprint([panelId, decision.reviewerId]).slice(0, 12)}`,
        panelId,
        anonymizedMemberId: memberByReviewer.get(decision.reviewerId) ?? "panel-member-0",
        role: decision.role,
        dissentingLabelId: decision.selectedLabelId,
        majorityLabelId,
        confidence: decision.confidence,
        isCritical,
        criticalReasonCodes,
        detectedAt,
      };
    });
}

export function hasCriticalDissent(dissent: readonly AgentDissent[]): boolean {
  return dissent.some((entry) => entry.isCritical);
}
