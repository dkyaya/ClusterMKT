import { z } from "zod";

export const IngestionLedgerEntrySchema = z.object({
  ledgerEntryId: z.string().min(1),
  runId: z.string().min(1),
  stage: z.string().min(1),
  status: z.enum([
    "accepted",
    "duplicate",
    "versioned",
    "review_required",
    "rejected",
    "quarantined",
    "dead_letter",
    "pending_retry",
  ]),
  inputIds: z.array(z.string().min(1)),
  outputIds: z.array(z.string().min(1)),
  explanationCodes: z.array(z.string().min(1)).min(1),
  recordedAt: z.iso.datetime(),
  provenanceIds: z.array(z.string().min(1)),
});

export type IngestionLedgerEntry = z.infer<typeof IngestionLedgerEntrySchema>;
