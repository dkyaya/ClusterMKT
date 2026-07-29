import type { Claim } from "../schemas/claim";

export function buildClusterOverview(claims: Claim[]): string {
  const accepted = claims.filter(
    (claim) =>
      claim.reviewStatus === "accepted" &&
      ["supported", "partially_supported", "disputed"].includes(claim.claimStatus),
  );
  if (accepted.length === 0) return "No supported claim is eligible for an overview.";
  return accepted
    .slice(0, 2)
    .map((claim) => claim.claimText)
    .join(" ");
}
