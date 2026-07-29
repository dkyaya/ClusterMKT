import { z } from "zod";
import { ClusterReviewStatusSchema } from "./cluster-review";

export const ReviewQueueItemSchema = z.object({
  reviewQueueItemId: z.string().min(1),
  clusterCandidateId: z.string().min(1),
  reviewStatus: ClusterReviewStatusSchema,
  reviewReasons: z.array(z.string().min(1)).min(1),
  blockingIssues: z.array(z.string().min(1)),
  nonBlockingWarnings: z.array(z.string().min(1)),
  createdAt: z.iso.datetime(),
  rulesVersion: z.string().regex(/^normalization-v\d+$/),
});

export type ReviewQueueItem = z.infer<typeof ReviewQueueItemSchema>;
