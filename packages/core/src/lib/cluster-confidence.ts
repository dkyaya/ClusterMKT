import type { Claim } from "../schemas/claim";

export function calculateClusterConfidence(input: {
  claims: Claim[];
  independentSourceCount: number;
  primarySourceCount: number;
  membershipAmbiguity: boolean;
  eventBoundaryAmbiguity: boolean;
  entityResolutionAmbiguity: boolean;
  unresolvedDisagreement: boolean;
  rumorOnly: boolean;
}): "high" | "medium" | "low" {
  const supported = input.claims.filter((claim) => claim.claimStatus === "supported").length;
  const hardAmbiguity =
    input.membershipAmbiguity || input.eventBoundaryAmbiguity || input.entityResolutionAmbiguity;
  if (input.rumorOnly || supported === 0 || hardAmbiguity) return "low";
  if (
    supported >= 2 &&
    input.independentSourceCount >= 2 &&
    (input.primarySourceCount > 0 || !input.unresolvedDisagreement)
  )
    return "high";
  return "medium";
}
