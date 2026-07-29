import { z } from "zod";

export const IngestionCheckpointSchema = z.object({
  checkpointId: z.string().min(1),
  runId: z.string().min(1),
  stage: z.enum([
    "created",
    "retrieval",
    "raw_persisted",
    "normalization",
    "clustering",
    "sector_briefs",
    "reconciliation",
    "completed",
  ]),
  completedSourceIds: z.array(z.string().min(1)),
  completedRecordIds: z.array(z.string().min(1)),
  cursorByAdapter: z.record(z.string(), z.string().nullable()),
  createdAt: z.iso.datetime(),
  checksum: z.string().length(64),
});

export type IngestionCheckpoint = z.infer<typeof IngestionCheckpointSchema>;
