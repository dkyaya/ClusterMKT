import { z } from "zod";
import { AnnotationTaskTypeSchema } from "./annotation-label";
import { AgentReviewRiskClassSchema } from "./agent-review-packet";

export const AgentPanelOutcomeSchema = z.enum([
  "agent_panel_unanimous",
  "agent_panel_strong_consensus",
  "agent_panel_majority",
  "agent_panel_split",
  "agent_panel_disputed",
  "agent_panel_insufficient",
  "agent_panel_invalid",
]);

export const AgentPanelResultSchema = z.object({
  panelId: z.string().regex(/^agent-panel-[a-f0-9]{12}$/),
  task: AnnotationTaskTypeSchema,
  riskClass: AgentReviewRiskClassSchema,
  panelSize: z.number().int().min(3).max(7),
  decisionCount: z.number().int().nonnegative(),
  validDecisionCount: z.number().int().nonnegative(),
  invalidDecisionCount: z.number().int().nonnegative(),
  majorityLabelId: z.string().min(1).nullable(),
  majorityShare: z.number().min(0).max(1).nullable(),
  unanimous: z.boolean(),
  outcome: AgentPanelOutcomeSchema,
  cannotDetermineRate: z.number().min(0).max(1),
  evidenceOverlapRate: z.number().min(0).max(1),
  explanationCodeOverlapRate: z.number().min(0).max(1),
  automaticAcceptanceAgreementRate: z.number().min(0).max(1),
  humanReviewRecommendationRate: z.number().min(0).max(1),
  confidenceDistribution: z.object({
    low: z.number().int().nonnegative(),
    medium: z.number().int().nonnegative(),
    high: z.number().int().nonnegative(),
  }),
  computedAt: z.iso.datetime(),
});

export type AgentPanelOutcome = z.infer<typeof AgentPanelOutcomeSchema>;
export type AgentPanelResult = z.infer<typeof AgentPanelResultSchema>;
