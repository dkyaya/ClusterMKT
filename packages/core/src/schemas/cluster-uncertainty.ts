import { z } from "zod";
import { ClusterReviewStatusSchema } from "./cluster-review";

export const ClusterUncertaintyTypeSchema = z.enum([
  "insufficient_evidence",
  "single_source",
  "metadata_limited",
  "conflicting_reports",
  "unresolved_timing",
  "unresolved_scope",
  "unresolved_quantity",
  "rumor",
  "forward_looking",
  "source_access_limited",
  "review_pending",
]);

export const ClusterUncertaintyRecordSchema = z.object({
  uncertaintyId: z.string().min(1),
  clusterCandidateId: z.string().min(1),
  relatedClaimIds: z.array(z.string().min(1)),
  type: ClusterUncertaintyTypeSchema,
  summary: z.string().min(1),
  evidenceGap: z.string().min(1),
  whatWouldResolveIt: z.string().min(1),
  relevantFutureEventOrSourceType: z.enum([
    "earnings_release",
    "regulatory_filing",
    "final_rule",
    "court_ruling",
    "economic_release",
    "company_guidance",
    "official_transcript",
    "independent_reporting",
  ]),
  severity: z.enum(["low", "medium", "high"]),
  reviewStatus: ClusterReviewStatusSchema,
  rulesVersion: z.string().regex(/^normalization-v\d+$/),
});

export type ClusterUncertaintyType = z.infer<typeof ClusterUncertaintyTypeSchema>;
export type ClusterUncertaintyRecord = z.infer<typeof ClusterUncertaintyRecordSchema>;
