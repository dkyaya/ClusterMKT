import { z } from "zod";
import { QuarantineReasonSchema } from "./quarantine-reason";

export const QuarantineRecordSchema = z.object({
  quarantineId: z.string().min(1),
  rawRecordId: z.string().min(1).nullable(),
  retrievalAttemptId: z.string().min(1),
  ingestionRunId: z.string().min(1),
  sourceId: z.string().min(1),
  adapterId: z.string().min(1),
  reason: QuarantineReasonSchema,
  severity: z.enum(["warning", "error", "critical"]),
  explanation: z.string().min(1),
  originalPayloadFixtureRef: z.string().min(1),
  provenanceIds: z.array(z.string().min(1)).min(1),
  reviewStatus: z.enum(["pending", "released", "rejected"]),
  releaseRequirements: z.array(z.string().min(1)),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  rulesVersion: z.string().min(1),
});

export type QuarantineRecord = z.infer<typeof QuarantineRecordSchema>;
