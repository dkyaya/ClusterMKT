import { z } from "zod";

export const ResumeTokenSchema = z.object({
  token: z.string().length(64),
  runId: z.string().min(1),
  checkpointId: z.string().min(1),
  lastSafeStage: z.string().min(1),
  createdAt: z.iso.datetime(),
  rulesVersion: z.string().min(1),
});

export type ResumeToken = z.infer<typeof ResumeTokenSchema>;
