import { z } from "zod";
import { ClusterReviewStatusSchema } from "./cluster-review";

export const DisagreementTypeSchema = z.enum([
  "factual",
  "quantitative",
  "temporal",
  "scope",
  "causal",
  "interpretive",
  "forecast",
  "attribution",
  "apparent_only",
  "source_update",
  "unknown",
]);

export const DisagreementGroupSchema = z.object({
  disagreementGroupId: z.string().min(1),
  claimIds: z.array(z.string().min(1)).min(2),
  competingPropositions: z.array(z.string().min(1)).min(2),
  disagreementType: DisagreementTypeSchema,
  supportingEvidenceBySide: z.array(z.array(z.string().min(1))).min(2),
  independentSourceCountsBySide: z.array(z.number().int().nonnegative()).min(2),
  primarySourcePresenceBySide: z.array(z.boolean()).min(2),
  oneSideSuperseded: z.boolean(),
  reconcilable: z.boolean(),
  resolutionStatus: z.enum(["open", "reconciled", "superseded", "review_pending"]),
  reviewStatus: ClusterReviewStatusSchema,
  explanationCodes: z.array(z.string().min(1)).min(1),
  rulesVersion: z.string().regex(/^normalization-v\d+$/),
});

export type DisagreementType = z.infer<typeof DisagreementTypeSchema>;
export type DisagreementGroup = z.infer<typeof DisagreementGroupSchema>;
