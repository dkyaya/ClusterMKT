import type { AgentPanelOutcome } from "../schemas/agent-panel-result";
import type { AgentAdjudicationOutcome } from "../schemas/agent-adjudication";
import type { OwnerEscalationStatus } from "../schemas/owner-review-queue-item";
import type { ReviewerConfidence } from "../schemas/annotation-label";
import type { AgentReviewRiskClass } from "../schemas/agent-review-packet";

export interface OwnerEscalationInput {
  panelOutcome: AgentPanelOutcome;
  riskClass: AgentReviewRiskClass;
  adjudicationOutcome: AgentAdjudicationOutcome | null;
  adjudicationConfidence: ReviewerConfidence | null;
  hasCriticalDissent: boolean;
  isVisibleQuantitativeClaim: boolean;
  isSectorWideDisputed: boolean;
  allegesProvenanceFailure: boolean;
  isAmbiguousTickerFalseMatchRisk: boolean;
  permitsUnsupportedDisplay: boolean;
  schemaOrHandbookDefective: boolean;
  repeatRunUnstable: boolean;
}

export interface OwnerEscalationDecision {
  status: OwnerEscalationStatus;
  reasons: string[];
}

const unresolvedAdjudicationOutcomes: AgentAdjudicationOutcome[] = [
  "agent_adjudicated_unresolved",
  "agent_adjudicated_insufficient_evidence",
  "agent_adjudicated_schema_issue",
  "agent_adjudicated_fixture_issue",
];

export function determineOwnerEscalation(input: OwnerEscalationInput): OwnerEscalationDecision {
  const reasons: string[] = [];
  if (input.panelOutcome === "agent_panel_disputed") reasons.push("PANEL_DISPUTED");
  if (
    input.adjudicationOutcome &&
    unresolvedAdjudicationOutcomes.includes(input.adjudicationOutcome)
  )
    reasons.push("ADJUDICATION_UNRESOLVED");
  if (input.adjudicationConfidence === "low") reasons.push("LOW_ADJUDICATOR_CONFIDENCE");
  if (input.hasCriticalDissent) reasons.push("SURVIVING_CRITICAL_DISSENT");
  if (input.isVisibleQuantitativeClaim) reasons.push("VISIBLE_QUANTITATIVE_CLAIM");
  if (input.isSectorWideDisputed) reasons.push("SECTOR_WIDE_CLASSIFICATION_DISPUTED");
  if (input.allegesProvenanceFailure) reasons.push("PROVENANCE_FAILURE_ALLEGED");
  if (input.isAmbiguousTickerFalseMatchRisk) reasons.push("AMBIGUOUS_TICKER_FALSE_MATCH_RISK");
  if (input.permitsUnsupportedDisplay) reasons.push("UNSUPPORTED_CONSUMER_DISPLAY_RISK");
  if (input.schemaOrHandbookDefective) reasons.push("SCHEMA_OR_HANDBOOK_DEFECTIVE");
  if (input.repeatRunUnstable) reasons.push("REPEATED_PANEL_RUNS_UNSTABLE");

  if (reasons.length === 0) return { status: "not_required", reasons: [] };

  const requiresBeforeDisplay =
    reasons.includes("ADJUDICATION_UNRESOLVED") ||
    reasons.includes("UNSUPPORTED_CONSUMER_DISPLAY_RISK") ||
    reasons.includes("PROVENANCE_FAILURE_ALLEGED") ||
    reasons.includes("AMBIGUOUS_TICKER_FALSE_MATCH_RISK");
  if (requiresBeforeDisplay) return { status: "required_before_display", reasons };

  const requiresBeforeCalibration =
    reasons.includes("PANEL_DISPUTED") ||
    reasons.includes("SURVIVING_CRITICAL_DISSENT") ||
    reasons.includes("LOW_ADJUDICATOR_CONFIDENCE") ||
    reasons.includes("SCHEMA_OR_HANDBOOK_DEFECTIVE") ||
    reasons.includes("REPEATED_PANEL_RUNS_UNSTABLE");
  if (requiresBeforeCalibration) return { status: "required_before_calibration", reasons };

  return { status: "recommended", reasons };
}
