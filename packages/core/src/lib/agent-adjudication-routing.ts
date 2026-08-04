import type { AgentPanelResult } from "../schemas/agent-panel-result";

export interface AgentAdjudicationRoutingResult {
  required: boolean;
  reasons: string[];
}

export function routeAgentAdjudication(panel: AgentPanelResult): AgentAdjudicationRoutingResult {
  const reasons: string[] = [];
  if (panel.riskClass === "high") reasons.push("HIGH_RISK_ALWAYS_ADJUDICATED");
  if (panel.outcome === "agent_panel_disputed") reasons.push("PANEL_DISPUTED");
  if (panel.outcome === "agent_panel_split") reasons.push("PANEL_SPLIT");
  if (panel.outcome === "agent_panel_majority") reasons.push("PANEL_MAJORITY_ONLY");
  if (panel.outcome === "agent_panel_insufficient") reasons.push("PANEL_INSUFFICIENT");
  if (panel.outcome === "agent_panel_invalid") reasons.push("PANEL_INVALID");
  return { required: reasons.length > 0, reasons };
}
