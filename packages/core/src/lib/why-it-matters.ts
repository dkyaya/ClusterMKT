import type { Claim } from "../schemas/claim";

export function buildWhyItMatters(claims: Claim[], relationExplanation: string): string {
  const supportedRelation = claims.some(
    (claim) => claim.reviewStatus === "accepted" && claim.claimType === "entity_relation",
  );
  return supportedRelation
    ? relationExplanation
    : "Why-it-matters language is withheld until an accepted entity or sector relation is supported.";
}
