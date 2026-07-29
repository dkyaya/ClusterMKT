import { z } from "zod";
import { IngestionCheckpointSchema } from "./ingestion-checkpoint";
import { IngestionLedgerEntrySchema } from "./ingestion-ledger-entry";
import { IngestionRunSchema } from "./ingestion-run";

const ids = z.array(z.string().min(1));
export const IngestionLedgerSchema = z.object({
  run: IngestionRunSchema,
  sourceIdsAttempted: ids,
  adapterIdsAttempted: ids,
  retrievalAttemptIds: ids,
  rawRecordIdsReceived: ids,
  duplicateRawIds: ids,
  newRawIds: ids,
  updatedRawIds: ids,
  rejectedRawIds: ids,
  quarantinedRawIds: ids,
  normalizedRecordIds: ids,
  reviewRequiredRecordIds: ids,
  acceptedClusterIds: ids,
  reviewRequiredClusterIds: ids,
  sectorBriefIds: ids,
  errorIds: ids,
  warningIds: ids,
  checkpointBefore: IngestionCheckpointSchema.nullable(),
  checkpointAfter: IngestionCheckpointSchema,
  resumeToken: z.string().nullable(),
  entries: z.array(IngestionLedgerEntrySchema),
  runManifestChecksum: z.string().length(64),
});

export type IngestionLedger = z.infer<typeof IngestionLedgerSchema>;
