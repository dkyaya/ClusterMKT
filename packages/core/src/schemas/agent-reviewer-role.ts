import { z } from "zod";
import { AnnotationTaskTypeSchema, ReviewerConfidenceSchema } from "./annotation-label";

export const AgentReviewerRoleIdSchema = z.enum([
  "literal_evidence_reviewer",
  "source_provenance_reviewer",
  "adversarial_reviewer",
  "domain_context_reviewer",
  "conservative_gatekeeper",
  "quantitative_integrity_reviewer",
  "event_boundary_reviewer",
]);

export const AgentReviewerRoleSchema = z.object({
  roleId: AgentReviewerRoleIdSchema,
  purpose: z.string().min(1),
  applicableTasks: z.array(AnnotationTaskTypeSchema).min(1),
  allowedEvidence: z.array(z.string().min(1)).min(1),
  forbiddenEvidence: z.array(z.string().min(1)).min(1),
  requiredChecklist: z.array(z.string().min(1)).min(1),
  allowedLabelPolicy: z.literal("task_label_set"),
  requiredExplanationFields: z.array(z.string().min(1)).min(1),
  confidenceScale: z.array(ReviewerConfidenceSchema).min(1),
  escalationRules: z.array(z.string().min(1)).min(1),
  promptVersion: z.string().regex(/^agent-role-prompt-v\d+$/),
  roleVersion: z.string().regex(/^agent-role-v\d+$/),
});

export type AgentReviewerRoleId = z.infer<typeof AgentReviewerRoleIdSchema>;
export type AgentReviewerRole = z.infer<typeof AgentReviewerRoleSchema>;
