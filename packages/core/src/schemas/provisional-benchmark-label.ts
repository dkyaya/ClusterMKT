import { z } from "zod";
import { AnnotationTaskTypeSchema, ReviewerConfidenceSchema } from "./annotation-label";
import { AgentReviewRiskClassSchema } from "./agent-review-packet";

export const ProvisionalBenchmarkStateSchema = z.enum([
  "agent_panel_consensus",
  "agent_panel_majority",
  "agent_panel_disputed",
  "agent_adjudicated",
  "owner_review_required",
  "owner_confirmed",
  "owner_overridden",
  "unresolved",
]);

export const ProvisionalBenchmarkLabelSchema = z.object({
  provisionalLabelId: z.string().regex(/^agent-calibration-label-[a-f0-9]{12}$/),
  panelId: z.string().regex(/^agent-panel-[a-f0-9]{12}$/),
  itemId: z.string().regex(/^gold-item-\d{4}$/),
  task: AnnotationTaskTypeSchema,
  labelFamily: z.literal("agent-calibration-v1"),
  riskClass: AgentReviewRiskClassSchema,
  state: ProvisionalBenchmarkStateSchema,
  selectedLabelId: z.string().min(1).nullable(),
  confidence: ReviewerConfidenceSchema,
  adjudicationId: z.string().min(1).nullable(),
  ownerEscalationStatus: z.string().min(1).nullable(),
  isHumanValidatedGold: z.literal(false),
  createdAt: z.iso.datetime(),
});

export type ProvisionalBenchmarkState = z.infer<typeof ProvisionalBenchmarkStateSchema>;
export type ProvisionalBenchmarkLabel = z.infer<typeof ProvisionalBenchmarkLabelSchema>;
