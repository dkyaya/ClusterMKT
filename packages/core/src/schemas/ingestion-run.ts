import { z } from "zod";
import { MarketEditionSchema } from "./edition";

export const IngestionRunStatusSchema = z.enum([
  "pending",
  "running",
  "completed",
  "completed_with_warnings",
  "failed_transient",
  "failed_permanent",
  "cancelled",
  "interrupted",
  "resumable",
  "quarantined",
]);

export const IngestionRunSchema = z.object({
  runId: z.string().min(1),
  edition: MarketEditionSchema,
  marketDate: z.iso.date(),
  scheduledSlotId: z.string().min(1),
  attemptNumber: z.number().int().positive(),
  startedAt: z.iso.datetime(),
  completedAt: z.iso.datetime().nullable(),
  status: IngestionRunStatusSchema,
  fixtureVersion: z.string().min(1),
  rulesVersions: z.record(z.string(), z.string().min(1)),
});

export type IngestionRunStatus = z.infer<typeof IngestionRunStatusSchema>;
export type IngestionRun = z.infer<typeof IngestionRunSchema>;
