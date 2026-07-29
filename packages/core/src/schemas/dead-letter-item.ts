import { z } from "zod";
import { IngestionErrorClassSchema } from "./adapter-error";

export const DeadLetterItemSchema = z.object({
  deadLetterId: z.string().min(1),
  runId: z.string().min(1),
  retrievalAttemptId: z.string().min(1),
  errorClass: IngestionErrorClassSchema,
  exhaustedAttempts: z.number().int().positive(),
  provenanceIds: z.array(z.string().min(1)).min(1),
  recommendedNextAction: z.string().min(1),
  createdAt: z.iso.datetime(),
});

export type DeadLetterItem = z.infer<typeof DeadLetterItemSchema>;
