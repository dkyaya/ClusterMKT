import { z } from "zod";
import { ConfidenceLevelSchema } from "./cluster-entity-relation";
import { ClusterReviewStatusSchema } from "./cluster-review";

export const ClusterMembershipStatusSchema = z.enum([
  "accepted",
  "related_context",
  "rejected",
  "review_required",
  "quarantined",
]);

export const ClusterMembershipDecisionSchema = z.object({
  normalizedRecordId: z.string().min(1),
  clusterCandidateId: z.string().min(1),
  membershipStatus: ClusterMembershipStatusSchema,
  explanationCodes: z.array(z.string().min(1)).min(1),
  confidence: ConfidenceLevelSchema,
  reviewStatus: ClusterReviewStatusSchema,
  supportingFields: z.array(z.string().min(1)),
  conflictingFields: z.array(z.string().min(1)),
  eventBoundaryRationale: z.string().min(1),
  rulesVersion: z.string().regex(/^normalization-v\d+$/),
});

export type ClusterMembershipStatus = z.infer<typeof ClusterMembershipStatusSchema>;
export type ClusterMembershipDecision = z.infer<typeof ClusterMembershipDecisionSchema>;
