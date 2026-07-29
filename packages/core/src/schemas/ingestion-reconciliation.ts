import { z } from "zod";

export const IngestionTerminalStateSchema = z.enum([
  "accepted_normalized",
  "exact_duplicate",
  "version_linked",
  "rejected",
  "quarantined",
  "dead_letter",
  "review_required",
  "pending_retry",
]);

export const IngestionReconciliationSchema = z.object({
  runId: z.string().min(1),
  counts: z.record(z.string(), z.number().int().nonnegative()),
  rawRecordStates: z.record(z.string(), IngestionTerminalStateSchema),
  unexplainedRawRecordIds: z.array(z.string().min(1)),
  multiplyAccountedRawRecordIds: z.array(z.string().min(1)),
  provenanceFailureIds: z.array(z.string().min(1)),
  reconciled: z.boolean(),
  explanationCodes: z.array(z.string().min(1)).min(1),
});

export type IngestionTerminalState = z.infer<typeof IngestionTerminalStateSchema>;
export type IngestionReconciliation = z.infer<typeof IngestionReconciliationSchema>;
