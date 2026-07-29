import { z } from "zod";

export const RetryDecisionSchema = z.object({
  action: z.enum(["retry", "dead_letter", "review", "stop", "quarantine"]),
  attemptNumber: z.number().int().positive(),
  simulatedDelayMs: z.number().int().nonnegative(),
  circuitState: z.enum(["closed", "open", "half_open"]),
  explanationCodes: z.array(z.string().min(1)).min(1),
});

export type RetryDecision = z.infer<typeof RetryDecisionSchema>;
