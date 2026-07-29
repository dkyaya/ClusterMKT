import { z } from "zod";
import { AdapterErrorSchema } from "./adapter-error";
import { RawSourceRecordSchema } from "./raw-source-record";
import { RetrievalMethodSchema } from "./retrieval-method";

export const AdapterOutputSchema = z.object({
  adapterId: z.string().min(1),
  sourceId: z.string().min(1),
  adapterVersion: z.string().min(1),
  retrievalMethod: RetrievalMethodSchema,
  resultRecords: z.array(RawSourceRecordSchema),
  nextCursor: z.string().nullable(),
  nextCheckpoint: z.string().nullable(),
  exhausted: z.boolean(),
  rateLimitState: z.enum(["available", "limited", "exhausted", "not_applicable"]),
  retryAfterSeconds: z.number().int().nonnegative().nullable(),
  warnings: z.array(z.string().min(1)),
  errors: z.array(AdapterErrorSchema),
  retrievalProvenanceId: z.string().min(1),
  fixtureVersion: z.string().min(1),
});

export type AdapterOutput = z.infer<typeof AdapterOutputSchema>;
