import { z } from "zod";
import { ConfidenceLevelSchema } from "./cluster-entity-relation";

export const ClusterReviewStatusSchema = z.enum([
  "accepted",
  "review_required",
  "rejected",
  "quarantined",
]);

export const ClusterReviewDecisionSchema = z.object({
  confidence: ConfidenceLevelSchema,
  status: ClusterReviewStatusSchema,
  reasons: z.array(z.string().min(1)),
  blockingIssues: z.array(z.string().min(1)),
  nonBlockingWarnings: z.array(z.string().min(1)),
  eligibleForDisplay: z.boolean(),
  eligibleForSectorBrief: z.boolean(),
  rulesVersion: z.string().regex(/^normalization-v\d+$/),
});

export type ClusterReviewStatus = z.infer<typeof ClusterReviewStatusSchema>;
export type ClusterReviewDecision = z.infer<typeof ClusterReviewDecisionSchema>;
