import { z } from "zod";
import { IngestionErrorClassSchema } from "./adapter-error";

export const RetryPolicySchema = z.object({
  retryPolicyId: z.string().min(1),
  maximumAttempts: z.number().int().positive().max(20),
  initialDelayMs: z.number().int().nonnegative(),
  maximumDelayMs: z.number().int().positive(),
  multiplier: z.number().min(1),
  jitterPolicy: z.enum(["none", "deterministic_fraction"]),
  retryableErrorClasses: z.array(IngestionErrorClassSchema),
  nonRetryableErrorClasses: z.array(IngestionErrorClassSchema),
  honorRetryAfter: z.boolean(),
  circuitBreakerThreshold: z.number().int().positive(),
  cooldownMs: z.number().int().nonnegative(),
  reviewEscalationThreshold: z.number().int().positive(),
});

export type RetryPolicy = z.infer<typeof RetryPolicySchema>;
