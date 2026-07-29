import type { Claim } from "../schemas/claim";
import { compareClaims } from "./claim-equivalence";

export function groupEquivalentClaims(claims: Claim[]): Claim[][] {
  const groups: Claim[][] = [];
  for (const claim of claims) {
    const group = groups.find((candidate) => {
      const representative = candidate[0];
      return Boolean(
        representative &&
        ["exactly_equivalent", "substantively_equivalent"].includes(
          compareClaims(representative, claim).relationship,
        ),
      );
    });
    if (group) group.push(claim);
    else groups.push([claim]);
  }
  return groups;
}
