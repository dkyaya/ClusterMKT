import { z } from "zod";
import { ClusterReviewStatusSchema } from "./cluster-review";

export const ClaimReviewSchema = z.object({
  claimId: z.string().min(1),
  reviewStatus: ClusterReviewStatusSchema,
  reasons: z.array(z.string().min(1)),
  blockingIssues: z.array(z.string().min(1)),
  reviewerNote: z.string().min(1).optional(),
  rulesVersion: z.string().regex(/^normalization-v\d+$/),
});

export type ClaimReview = z.infer<typeof ClaimReviewSchema>;
