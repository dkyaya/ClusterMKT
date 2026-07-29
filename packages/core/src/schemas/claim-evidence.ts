import { z } from "zod";

export const ClaimEvidenceDepthSchema = z.enum([
  "headline_only",
  "metadata",
  "publisher_abstract",
  "primary_release",
  "regulatory_filing",
  "government_release",
  "official_transcript",
  "full_fixture_text",
  "quoted_excerpt_fixture",
  "related_listening_only",
]);

export const ClaimEvidenceSchema = z
  .object({
    evidenceId: z.string().min(1),
    sourceRecordId: z.string().min(1),
    rawRecordIds: z.array(z.string().min(1)).min(1),
    underlyingWorkId: z.string().min(1),
    sourceFamilyId: z.string().min(1),
    evidenceDepth: ClaimEvidenceDepthSchema,
    supportingSpan: z.string().min(1).optional(),
    structuredField: z.string().min(1).optional(),
    independent: z.boolean(),
    primary: z.boolean(),
    syndicated: z.boolean(),
    acceptedForClaim: z.boolean(),
    explanationCode: z.string().min(1),
    rulesVersion: z.string().regex(/^normalization-v\d+$/),
  })
  .superRefine((value, context) => {
    if (!value.supportingSpan && !value.structuredField) {
      context.addIssue({
        code: "custom",
        message: "Claim evidence requires a supporting span or structured field.",
      });
    }
  });

export type ClaimEvidenceDepth = z.infer<typeof ClaimEvidenceDepthSchema>;
export type ClaimEvidence = z.infer<typeof ClaimEvidenceSchema>;
