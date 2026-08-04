import type { AgentPanelResult } from "../schemas/agent-panel-result";
import type { AgentAdjudication } from "../schemas/agent-adjudication";
import type { ProvisionalBenchmarkState } from "../schemas/provisional-benchmark-label";
import type { OwnerEscalationStatus } from "../schemas/owner-review-queue-item";
import type { AgentReviewRiskClass } from "../schemas/agent-review-packet";

export interface PromotionInput {
  panel: AgentPanelResult;
  adjudication: AgentAdjudication | null;
  ownerEscalationStatus: OwnerEscalationStatus;
  hasCriticalDissent: boolean;
  provenanceConcern: boolean;
}

export function determineProvisionalBenchmarkState(
  input: PromotionInput,
): ProvisionalBenchmarkState {
  if (input.ownerEscalationStatus === "owner_confirmed") return "owner_confirmed";
  if (input.ownerEscalationStatus === "owner_overridden") return "owner_overridden";
  if (
    input.ownerEscalationStatus === "required_before_calibration" ||
    input.ownerEscalationStatus === "required_before_display"
  )
    return "owner_review_required";

  if (input.adjudication) {
    if (
      input.adjudication.outcome === "agent_adjudicated_unresolved" ||
      input.adjudication.outcome === "agent_adjudicated_insufficient_evidence" ||
      input.adjudication.outcome === "agent_adjudicated_schema_issue" ||
      input.adjudication.outcome === "agent_adjudicated_fixture_issue"
    )
      return "unresolved";
    if (
      input.adjudication.outcome === "agent_adjudicated" ||
      input.adjudication.outcome === "agent_adjudicated_review_required"
    ) {
      return input.hasCriticalDissent ? "agent_panel_disputed" : "agent_adjudicated";
    }
  }

  if (input.panel.riskClass === "high") return "unresolved";
  if (input.hasCriticalDissent || input.panel.outcome === "agent_panel_disputed")
    return "agent_panel_disputed";
  if (
    (input.panel.outcome === "agent_panel_unanimous" ||
      input.panel.outcome === "agent_panel_strong_consensus") &&
    !input.provenanceConcern
  )
    return "agent_panel_consensus";
  if (input.panel.outcome === "agent_panel_majority") return "agent_panel_majority";
  return "unresolved";
}

export function canPromoteToAgentPanelConsensus(
  riskClass: AgentReviewRiskClass,
  state: ProvisionalBenchmarkState,
): boolean {
  if (riskClass === "high") return false;
  return state === "agent_panel_consensus";
}
