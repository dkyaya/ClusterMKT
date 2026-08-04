import { z } from "zod";
import { AnnotationTaskTypeSchema } from "./annotation-label";
import { AgentReviewerRoleIdSchema } from "./agent-reviewer-role";

export const AgentReviewRiskClassSchema = z.enum(["low", "standard", "high"]);

export const AgentReviewPacketSchema = z.object({
  packetId: z.string().regex(/^agent-packet-[a-f0-9]{12}$/),
  packetHash: z.string().regex(/^[a-f0-9]{64}$/),
  packetVersion: z.string().regex(/^agent-packet-v\d+$/),
  task: AnnotationTaskTypeSchema,
  role: AgentReviewerRoleIdSchema,
  riskClass: AgentReviewRiskClassSchema,
  difficultyClass: z.enum(["routine", "challenging", "adversarial"]),
  reviewerInstructions: z.string().min(1),
  handbookExcerpt: z.string().min(1),
  allowedLabelIds: z.array(z.string().regex(/^label-[a-z0-9-]+$/)).min(1),
  evidencePackage: z.object({
    headline: z.string().min(1),
    abstract: z.string().nullable(),
    structuredFields: z.record(z.string(), z.string()),
    permittedExcerpt: z.string().nullable(),
  }),
  allowedProvenanceFields: z.array(z.string().min(1)).min(1),
  requiredResponseFields: z.array(z.string().min(1)).min(1),
});

export type AgentReviewRiskClass = z.infer<typeof AgentReviewRiskClassSchema>;
export type AgentReviewPacket = z.infer<typeof AgentReviewPacketSchema>;
