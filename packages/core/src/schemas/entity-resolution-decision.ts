import { z } from "zod";
import { EntityMentionSchema } from "./entity-mention";

export const EntityResolutionDecisionSchema = z.object({
  rawRecordId: z.string().min(1),
  candidates: z.array(EntityMentionSchema),
  acceptedEntityIds: z.array(z.string().min(1)),
  rejectedEntityIds: z.array(z.string().min(1)),
  reviewRequiredEntityIds: z.array(z.string().min(1)),
  rulesVersion: z.string().regex(/^normalization-v\d+$/),
});

export type EntityResolutionDecision = z.infer<typeof EntityResolutionDecisionSchema>;
