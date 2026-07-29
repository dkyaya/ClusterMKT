import { z } from "zod";

export const IdempotencyDecisionKindSchema = z.enum([
  "create",
  "skip_exact_duplicate",
  "link_version",
  "update_existing",
  "quarantine_collision",
  "review_required",
]);

export const IdempotencyDecisionSchema = z.object({
  idempotencyKey: z.string().length(64),
  decision: IdempotencyDecisionKindSchema,
  existingRecordId: z.string().min(1).nullable(),
  newRecordId: z.string().min(1).nullable(),
  duplicateReason: z.string().min(1).nullable(),
  updateReason: z.string().min(1).nullable(),
  reviewRequired: z.boolean(),
  explanationCodes: z.array(z.string().min(1)).min(1),
});

export type IdempotencyDecisionKind = z.infer<typeof IdempotencyDecisionKindSchema>;
export type IdempotencyDecision = z.infer<typeof IdempotencyDecisionSchema>;
