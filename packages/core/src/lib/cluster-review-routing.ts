import { ClusterReviewDecisionSchema, type ClusterReviewDecision } from "../schemas/cluster-review";
import type { Claim } from "../schemas/claim";
import type { ClaimEvidence } from "../schemas/claim-evidence";
import { calculateClusterConfidence } from "./cluster-confidence";

export function routeClusterReview(input: {
  claims: Claim[];
  evidence: ClaimEvidence[];
  independentSourceCount: number;
  primarySourceCount: number;
  membershipAmbiguity?: boolean;
  eventBoundaryAmbiguity?: boolean;
  entityResolutionAmbiguity?: boolean;
  unresolvedDisagreement?: boolean;
  rumorOnly?: boolean;
  missingPublicationInformation?: boolean;
}): ClusterReviewDecision {
  const blockingIssues: string[] = [];
  const nonBlockingWarnings: string[] = [];
  const reasons: string[] = [];
  const visibleClaims = input.claims.filter((claim) => claim.reviewStatus === "accepted");
  if (visibleClaims.some((claim) => claim.evidenceIds.length === 0))
    blockingIssues.push("MISSING_CLAIM_PROVENANCE");
  if (
    visibleClaims.some((claim) =>
      ["unsupported", "metadata_only", "quarantined"].includes(claim.claimStatus),
    )
  ) {
    blockingIssues.push("UNSUPPORTED_VISIBLE_CLAIM");
  }
  const acceptedEvidence = new Set(visibleClaims.flatMap((claim) => claim.evidenceIds));
  if (
    input.evidence.some(
      (item) =>
        acceptedEvidence.has(item.evidenceId) && item.evidenceDepth === "related_listening_only",
    )
  ) {
    blockingIssues.push("PODCAST_METADATA_FACTUAL_CLAIM");
  }
  if (
    input.evidence.some((item) => acceptedEvidence.has(item.evidenceId) && !item.acceptedForClaim)
  ) {
    blockingIssues.push("INELIGIBLE_EVIDENCE_SUPPORT");
  }
  if (input.eventBoundaryAmbiguity) reasons.push("AMBIGUOUS_EVENT_BOUNDARY");
  if (input.entityResolutionAmbiguity) reasons.push("UNRESOLVED_ENTITY_AMBIGUITY");
  if (input.membershipAmbiguity) reasons.push("AMBIGUOUS_CLUSTER_MEMBERSHIP");
  if (input.unresolvedDisagreement) reasons.push("UNRESOLVED_DISAGREEMENT");
  if (input.rumorOnly) reasons.push("RUMOR_ONLY_SUPPORT");
  if (input.missingPublicationInformation) reasons.push("MISSING_PUBLICATION_INFORMATION");
  if (input.independentSourceCount <= 1) nonBlockingWarnings.push("LIMITED_INDEPENDENT_SUPPORT");
  if (input.evidence.length > 1 && input.independentSourceCount <= 1)
    nonBlockingWarnings.push("SYNDICATION_ADJUSTED_SUPPORT");
  const confidence = calculateClusterConfidence({
    claims: input.claims,
    independentSourceCount: input.independentSourceCount,
    primarySourceCount: input.primarySourceCount,
    membershipAmbiguity: Boolean(input.membershipAmbiguity),
    eventBoundaryAmbiguity: Boolean(input.eventBoundaryAmbiguity),
    entityResolutionAmbiguity: Boolean(input.entityResolutionAmbiguity),
    unresolvedDisagreement: Boolean(input.unresolvedDisagreement),
    rumorOnly: Boolean(input.rumorOnly),
  });
  let status: ClusterReviewDecision["status"] = "accepted";
  if (blockingIssues.length > 0) status = "rejected";
  else if (reasons.length > 0 || confidence === "low") status = "review_required";
  const eligibleForDisplay = status === "accepted" && visibleClaims.length > 0;
  return ClusterReviewDecisionSchema.parse({
    confidence,
    status,
    reasons: [...reasons, ...blockingIssues],
    blockingIssues,
    nonBlockingWarnings,
    eligibleForDisplay,
    eligibleForSectorBrief: eligibleForDisplay && !input.rumorOnly,
    rulesVersion: input.claims[0]?.rulesVersion ?? "normalization-v1",
  });
}
