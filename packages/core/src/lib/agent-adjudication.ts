import type { AgentAdjudication } from "../schemas/agent-adjudication";
import type { AgentPanelResult } from "../schemas/agent-panel-result";
import { routeAgentAdjudication } from "./agent-adjudication-routing";
import {
  adjudicationReferencesAnonymizedReviewers,
  validateAgentAdjudicationShape,
} from "./agent-adjudication-validation";

export function validateAgentAdjudication(
  panel: AgentPanelResult,
  adjudication: AgentAdjudication,
) {
  const route = routeAgentAdjudication(panel);
  const shape = validateAgentAdjudicationShape(adjudication);
  const errors = [
    ...(adjudication.panelId !== panel.panelId ? ["PANEL_MISMATCH"] : []),
    ...(!shape.passed ? ["ADJUDICATION_SCHEMA_INCOMPLETE"] : []),
    ...(!adjudicationReferencesAnonymizedReviewers(adjudication)
      ? ["ADJUDICATION_MUST_REFERENCE_ANONYMIZED_REVIEWERS"]
      : []),
    ...(adjudication.evidenceRelied.length === 0 &&
    adjudication.outcome !== "agent_adjudicated_unresolved" &&
    adjudication.outcome !== "agent_adjudicated_insufficient_evidence"
      ? ["ADJUDICATION_EVIDENCE_REQUIRED"]
      : []),
    ...(adjudication.decisionsAccepted.some((id) => adjudication.decisionsRejected.includes(id))
      ? ["DECISION_CANNOT_BE_BOTH_ACCEPTED_AND_REJECTED"]
      : []),
  ];
  return { accepted: errors.length === 0, errors, route };
}
