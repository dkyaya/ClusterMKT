import { z } from "zod";
import { IngestionErrorClassSchema } from "./adapter-error";
import { RetrievalMethodSchema } from "./retrieval-method";
import { RetrievalResponseMetadataSchema } from "./retrieval-response-metadata";

export const RetrievalAttemptSchema = z.object({
  retrievalAttemptId: z.string().min(1),
  ingestionRunId: z.string().min(1),
  adapterId: z.string().min(1),
  sourceId: z.string().min(1),
  retrievalMethod: RetrievalMethodSchema,
  requestedWindow: z.object({ from: z.iso.datetime(), to: z.iso.datetime() }),
  cursorBefore: z.string().nullable(),
  cursorAfter: z.string().nullable(),
  checkpointBefore: z.string().nullable(),
  checkpointAfter: z.string().nullable(),
  startedAt: z.iso.datetime(),
  completedAt: z.iso.datetime(),
  durationMs: z.number().int().nonnegative(),
  dryRun: z.literal(true),
  fixtureRef: z.string().min(1),
  requestFingerprint: z.string().length(64),
  response: RetrievalResponseMetadataSchema,
  errorClassification: IngestionErrorClassSchema.nullable(),
  warningCodes: z.array(z.string().min(1)),
  adapterVersion: z.string().min(1),
  registryVersion: z.string().min(1),
  rulesVersion: z.string().min(1),
  userAgentFixtureLabel: z.string().min(1),
});

export type RetrievalAttempt = z.infer<typeof RetrievalAttemptSchema>;
