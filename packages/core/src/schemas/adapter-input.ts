import { z } from "zod";

export const AdapterInputSchema = z.object({
  ingestionRunId: z.string().min(1),
  cursor: z.string().nullable(),
  checkpoint: z.string().nullable(),
  requestedWindow: z.object({ from: z.iso.datetime(), to: z.iso.datetime() }),
  maximumItemCount: z.number().int().positive().max(1000),
  dryRun: z.literal(true),
  retrievalTimestamp: z.iso.datetime(),
  fixtureId: z.string().min(1),
});

export type AdapterInput = z.infer<typeof AdapterInputSchema>;
