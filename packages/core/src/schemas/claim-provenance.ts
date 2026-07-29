import { z } from "zod";

export const ClaimProvenanceSchema = z.object({
  claimId: z.string().min(1),
  evidenceIds: z.array(z.string().min(1)).min(1),
  normalizedRecordIds: z.array(z.string().min(1)).min(1),
  rawRecordIds: z.array(z.string().min(1)).min(1),
  underlyingWorkIds: z.array(z.string().min(1)).min(1),
  sourceFamilyIds: z.array(z.string().min(1)).min(1),
  explanationCodes: z.array(z.string().min(1)).min(1),
  rulesVersion: z.string().regex(/^normalization-v\d+$/),
});

export type ClaimProvenance = z.infer<typeof ClaimProvenanceSchema>;
