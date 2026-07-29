import { z } from "zod";

export const RetrievalResponseMetadataSchema = z.object({
  fixtureStatus: z.number().int().min(100).max(599).nullable(),
  endpointClass: z.string().min(1),
  rateLimitState: z.enum(["available", "limited", "exhausted", "not_applicable"]),
  retryAfterSeconds: z.number().int().nonnegative().nullable(),
  responseFingerprint: z.string().length(64),
  itemCount: z.number().int().nonnegative(),
});

export type RetrievalResponseMetadata = z.infer<typeof RetrievalResponseMetadataSchema>;
