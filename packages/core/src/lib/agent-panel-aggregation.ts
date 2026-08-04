import type { AgentReviewDecision } from "../schemas/agent-review-decision";
import type { AnnotationTaskType } from "../schemas/annotation-label";
import type { AgentPanelOutcome, AgentPanelResult } from "../schemas/agent-panel-result";
import type { AgentReviewRiskClass } from "../schemas/agent-review-packet";
import { evidenceOverlapRate, explanationCodeOverlapRate } from "./evidence-overlap";
import { validateAgentReviewDecisionShape } from "./agent-review-validation";

export interface AgentPanelAggregationInput {
  panelId: string;
  task: AnnotationTaskType;
  riskClass: AgentReviewRiskClass;
  expectedPanelSize: number;
  decisions: readonly AgentReviewDecision[];
  hasCriticalDissent: boolean;
  computedAt: string;
}

export function computeAgentPanelResult(input: AgentPanelAggregationInput): AgentPanelResult {
  const validDecisions = input.decisions.filter(
    (decision) => validateAgentReviewDecisionShape(decision).passed,
  );
  const invalidDecisionCount = input.decisions.length - validDecisions.length;
  const cannotDetermineCount = validDecisions.filter((decision) => decision.cannotDetermine).length;
  const determinateDecisions = validDecisions.filter((decision) => !decision.cannotDetermine);

  const counts = new Map<string, number>();
  for (const decision of determinateDecisions) {
    if (decision.selectedLabelId)
      counts.set(decision.selectedLabelId, (counts.get(decision.selectedLabelId) ?? 0) + 1);
  }
  const ranked = [...counts.entries()].sort(([, left], [, right]) => right - left);
  const topEntry = ranked[0] ?? null;
  const majorityLabelId = topEntry ? topEntry[0] : null;
  const majorityShare =
    determinateDecisions.length && topEntry ? topEntry[1] / determinateDecisions.length : null;

  const provenanceObjection = validDecisions.some(
    (decision) =>
      decision.role === "source_provenance_reviewer" &&
      (decision.humanReviewRecommended ||
        decision.explanationCodes.some((code) => code.includes("PROVENANCE"))),
  );

  const insufficientThreshold = Math.ceil(input.expectedPanelSize / 2);
  const unanimous =
    validDecisions.length === input.expectedPanelSize &&
    cannotDetermineCount === 0 &&
    ranked.length === 1 &&
    majorityShare === 1;

  let outcome: AgentPanelOutcome;
  if (input.hasCriticalDissent) {
    outcome = "agent_panel_disputed";
  } else if (validDecisions.length === 0) {
    outcome = "agent_panel_invalid";
  } else if (
    invalidDecisionCount + cannotDetermineCount >= insufficientThreshold ||
    validDecisions.length < input.expectedPanelSize
  ) {
    outcome = "agent_panel_insufficient";
  } else if (unanimous) {
    outcome = "agent_panel_unanimous";
  } else if (majorityShare !== null && majorityShare >= 0.8 && !provenanceObjection) {
    outcome = "agent_panel_strong_consensus";
  } else if (majorityShare !== null && majorityShare > 0.6) {
    outcome = "agent_panel_majority";
  } else {
    outcome = "agent_panel_split";
  }

  return {
    panelId: input.panelId,
    task: input.task,
    riskClass: input.riskClass,
    panelSize: input.expectedPanelSize,
    decisionCount: input.decisions.length,
    validDecisionCount: validDecisions.length,
    invalidDecisionCount,
    majorityLabelId,
    majorityShare,
    unanimous,
    outcome,
    cannotDetermineRate: validDecisions.length ? cannotDetermineCount / validDecisions.length : 0,
    evidenceOverlapRate: evidenceOverlapRate(validDecisions),
    explanationCodeOverlapRate: explanationCodeOverlapRate(validDecisions),
    automaticAcceptanceAgreementRate: validDecisions.length
      ? validDecisions.filter((decision) => decision.automaticAcceptanceRecommended).length /
        validDecisions.length
      : 0,
    humanReviewRecommendationRate: validDecisions.length
      ? validDecisions.filter((decision) => decision.humanReviewRecommended).length /
        validDecisions.length
      : 0,
    confidenceDistribution: {
      low: validDecisions.filter((decision) => decision.confidence === "low").length,
      medium: validDecisions.filter((decision) => decision.confidence === "medium").length,
      high: validDecisions.filter((decision) => decision.confidence === "high").length,
    },
    computedAt: input.computedAt,
  };
}
