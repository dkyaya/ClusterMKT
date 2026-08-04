import type { AnnotationItem } from "../schemas/annotation-item";
import type { AgentReviewRiskClass } from "../schemas/agent-review-packet";
import type { AgentReviewerRoleId } from "../schemas/agent-reviewer-role";

export interface AgentPanelPolicyConfig {
  riskRoles: Record<AgentReviewRiskClass, readonly AgentReviewerRoleId[]>;
  panelSizes: Record<AgentReviewRiskClass, number>;
  highRiskStrataTriggers: Record<string, readonly string[]>;
  highRiskTasks: readonly string[];
}

export interface RiskClassification {
  riskClass: AgentReviewRiskClass;
  reasons: string[];
}

export function classifyAgentReviewRisk(
  item: AnnotationItem,
  config: AgentPanelPolicyConfig,
): RiskClassification {
  const strata = item.samplingStrata as unknown as Record<string, string>;
  const reasons = Object.entries(config.highRiskStrataTriggers)
    .filter(([dimension, values]) => values.includes(strata[dimension] ?? ""))
    .map(([dimension]) => `HIGH_RISK_STRATUM_${dimension}_${strata[dimension]}`);
  if (config.highRiskTasks.includes(item.task)) reasons.push(`HIGH_RISK_TASK_${item.task}`);
  if (item.difficultyClass === "adversarial") reasons.push("ADVERSARIAL_DIFFICULTY");
  if (reasons.length > 0) return { riskClass: "high", reasons };
  if (item.difficultyClass === "challenging")
    return { riskClass: "standard", reasons: ["CHALLENGING_DIFFICULTY"] };
  return { riskClass: "low", reasons: [] };
}

export function rolesForRisk(
  riskClass: AgentReviewRiskClass,
  config: AgentPanelPolicyConfig,
): readonly AgentReviewerRoleId[] {
  return config.riskRoles[riskClass];
}

export function panelSizeForRisk(
  riskClass: AgentReviewRiskClass,
  config: AgentPanelPolicyConfig,
): number {
  return config.panelSizes[riskClass];
}
