import {
  ClusterUncertaintyRecordSchema,
  type ClusterUncertaintyRecord,
  type ClusterUncertaintyType,
} from "../schemas/cluster-uncertainty";
import type { Claim } from "../schemas/claim";
import { resolutionConditionFor } from "./resolution-condition";

export function buildClusterUncertainty(input: {
  uncertaintyId: string;
  clusterCandidateId: string;
  type: ClusterUncertaintyType;
  claims: Claim[];
  evidenceGap: string;
  summary: string;
  severity?: "low" | "medium" | "high";
}): ClusterUncertaintyRecord {
  const resolution = resolutionConditionFor(input.type);
  return ClusterUncertaintyRecordSchema.parse({
    uncertaintyId: input.uncertaintyId,
    clusterCandidateId: input.clusterCandidateId,
    relatedClaimIds: input.claims.map((claim) => claim.claimId),
    type: input.type,
    summary: input.summary,
    evidenceGap: input.evidenceGap,
    whatWouldResolveIt: resolution.whatWouldResolveIt,
    relevantFutureEventOrSourceType: resolution.futureSourceType,
    severity: input.severity ?? "medium",
    reviewStatus:
      input.type === "review_pending" || input.type === "rumor" ? "review_required" : "accepted",
    rulesVersion: input.claims[0]?.rulesVersion ?? "normalization-v1",
  });
}
