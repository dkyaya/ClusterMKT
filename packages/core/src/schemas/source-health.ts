import { z } from "zod";

export const SourceHealthSchema = z.object({
  sourceId: z.string().min(1),
  status: z.enum(["fixture_healthy", "fixture_degraded", "disabled", "blocked", "unknown"]),
  consecutiveFailures: z.number().int().nonnegative(),
  circuitState: z.enum(["closed", "open", "half_open"]),
  lastFixtureAttemptAt: z.iso.datetime().optional(),
  warningCodes: z.array(z.string().min(1)),
});

export type SourceHealth = z.infer<typeof SourceHealthSchema>;
