import { z } from "zod";
import { ClusterReviewStatusSchema } from "./cluster-review";

export const ClusterPresentationSchema = z.object({
  clusterCandidateId: z.string().min(1),
  title: z.string().min(1),
  shortOverview: z.string().min(1),
  whyItMatters: z.string().min(1),
  whatHappenedClaimIds: z.array(z.string().min(1)),
  agreementGroupIds: z.array(z.string().min(1)),
  disagreementGroupIds: z.array(z.string().min(1)),
  uncertaintyIds: z.array(z.string().min(1)),
  resolutionConditionIds: z.array(z.string().min(1)),
  relatedStocks: z.array(z.string().min(1)),
  relatedSectors: z.array(z.string().min(1)),
  relatedThemes: z.array(z.string().min(1)),
  rawSourceCount: z.number().int().nonnegative(),
  independentSourceCount: z.number().int().nonnegative(),
  primarySourceCount: z.number().int().nonnegative(),
  lastUpdatedAt: z.iso.datetime(),
  firstDetectedAt: z.iso.datetime(),
  reviewStatus: ClusterReviewStatusSchema,
  rulesVersion: z.string().regex(/^normalization-v\d+$/),
});

export type ClusterPresentation = z.infer<typeof ClusterPresentationSchema>;
