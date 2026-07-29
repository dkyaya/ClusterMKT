import { normalizeClaimProposition } from "./claim-normalization";

export function canonicalizeClaim(input: {
  subjectIds: string[];
  predicate: string;
  object?: string;
  timeScope?: string;
  geography?: string;
}): string {
  return [
    [...input.subjectIds].sort().join("+"),
    normalizeClaimProposition(input.predicate),
    normalizeClaimProposition(input.object ?? ""),
    input.timeScope ?? "",
    input.geography ?? "",
  ].join("|");
}
