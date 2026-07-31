import type { AnnotationItem } from "../schemas/annotation-item";
import type { ReviewerDecision } from "../schemas/reviewer-decision";
import { getReviewerWorkflowState } from "./reviewer-workflow";

const highRiskTasks = new Set(["claims", "entity_resolution", "review_routing", "sector_coverage"]);

export interface AdjudicationRoutingContext {
  criticalEvidenceRuleImplicated?: boolean;
  materialPredictionDisagreement?: boolean;
}

export function routeAdjudication(
  item: AnnotationItem,
  decisions: readonly ReviewerDecision[],
  context: AdjudicationRoutingContext = {},
) {
  const state = getReviewerWorkflowState(item, decisions);
  const highRisk =
    highRiskTasks.has(item.task) && decisions.some(({ confidence }) => confidence !== "high");
  const required =
    state.adjudicationRequired ||
    highRisk ||
    item.amendmentHistory.length > 0 ||
    context.criticalEvidenceRuleImplicated === true ||
    context.materialPredictionDisagreement === true;
  return {
    required,
    reasons: [
      ...state.explanationCodes,
      ...(highRisk ? ["HIGH_RISK_LABEL_REQUIRES_ADJUDICATION"] : []),
      ...(item.amendmentHistory.length ? ["PRIOR_GOLD_LABEL_AMENDED"] : []),
      ...(context.criticalEvidenceRuleImplicated ? ["CRITICAL_EVIDENCE_RULE"] : []),
      ...(context.materialPredictionDisagreement ? ["MATERIAL_PREDICTION_DISAGREEMENT"] : []),
    ],
  };
}
