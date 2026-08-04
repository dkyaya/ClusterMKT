import { z } from "zod";
import { ReviewerConfidenceSchema } from "./annotation-label";
import { AgentReviewerRoleIdSchema } from "./agent-reviewer-role";

export const AgentReviewerIdSchema = z.enum([
  "reviewer-alpha",
  "reviewer-bravo",
  "reviewer-charlie",
  "reviewer-delta",
  "reviewer-echo",
  "reviewer-foxtrot",
  "reviewer-golf",
]);

export const AgentReviewDecisionSchema = z.object({
  packetId: z.string().regex(/^agent-packet-[a-f0-9]{12}$/),
  packetHash: z.string().regex(/^[a-f0-9]{64}$/),
  role: AgentReviewerRoleIdSchema,
  reviewerId: AgentReviewerIdSchema,
  selectedLabelId: z
    .string()
    .regex(/^label-[a-z0-9-]+$/)
    .nullable(),
  alternativeLabelId: z
    .string()
    .regex(/^label-[a-z0-9-]+$/)
    .nullable(),
  evidenceReferences: z.array(z.string().min(1)),
  supportingFields: z.array(z.string().min(1)),
  conflictingFields: z.array(z.string().min(1)),
  missingEvidence: z.array(z.string().min(1)),
  explanationCodes: z.array(z.string().min(1)),
  confidence: ReviewerConfidenceSchema,
  automaticAcceptanceRecommended: z.boolean(),
  humanReviewRecommended: z.boolean(),
  dissentExpected: z.boolean(),
  cannotDetermine: z.boolean(),
  promptVersion: z.string().regex(/^agent-role-prompt-v\d+$/),
  submittedAt: z.iso.datetime(),
});

export type AgentReviewerId = z.infer<typeof AgentReviewerIdSchema>;
export type AgentReviewDecision = z.infer<typeof AgentReviewDecisionSchema>;
