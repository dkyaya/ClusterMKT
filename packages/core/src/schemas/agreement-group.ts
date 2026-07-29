import { z } from "zod";
import { ClusterReviewStatusSchema } from "./cluster-review";

export const AgreementStrengthSchema = z.enum([
  "single_source",
  "limited_corroboration",
  "multi_source",
  "primary_plus_independent",
  "broad_corroboration",
]);

export const AgreementGroupSchema = z.object({
  agreementGroupId: z.string().min(1),
  canonicalClaimId: z.string().min(1),
  supportingClaimIds: z.array(z.string().min(1)).min(1),
  independentSourceFamilyIds: z.array(z.string().min(1)),
  primarySourcePresent: z.boolean(),
  evidenceDepthDistribution: z.record(z.string(), z.number().int().nonnegative()),
  agreementStrength: AgreementStrengthSchema,
  qualification: z.string().min(1),
  reviewStatus: ClusterReviewStatusSchema,
  explanationCodes: z.array(z.string().min(1)).min(1),
  rulesVersion: z.string().regex(/^normalization-v\d+$/),
});

export type AgreementStrength = z.infer<typeof AgreementStrengthSchema>;
export type AgreementGroup = z.infer<typeof AgreementGroupSchema>;
