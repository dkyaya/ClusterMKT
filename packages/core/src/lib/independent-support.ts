import type { ClaimEvidence } from "../schemas/claim-evidence";
import type { IndependentSupportResult } from "../types/claims";
import { independentEvidenceKey } from "./source-independence";

export function countIndependentSupport(evidence: ClaimEvidence[]): IndependentSupportResult {
  const accepted = evidence.filter(
    (item) => item.acceptedForClaim && item.evidenceDepth !== "related_listening_only",
  );
  const works = new Set(accepted.map((item) => item.underlyingWorkId));
  const independentKeys = new Set(
    accepted.map(independentEvidenceKey).filter((key): key is string => Boolean(key)),
  );
  const primarySourceCount = new Set(
    accepted.filter((item) => item.primary).map((item) => item.underlyingWorkId),
  ).size;
  const secondaryIndependentCount = new Set(
    accepted
      .filter((item) => !item.primary && item.independent && !item.syndicated)
      .map((item) => item.underlyingWorkId),
  ).size;
  const syndicationAdjustedCount = new Set(
    accepted.map((item) =>
      item.syndicated ? `syndication:${item.underlyingWorkId}` : independentEvidenceKey(item),
    ),
  ).size;
  const explanationCodes = ["COUNTED_BY_UNDERLYING_WORK", "SYNDICATION_ADJUSTED"];
  if (accepted.some((item) => item.primary)) explanationCodes.push("PRIMARY_SOURCE_PRESENT");
  if (secondaryIndependentCount > 0) explanationCodes.push("INDEPENDENT_SECONDARY_PRESENT");
  return {
    rawEvidenceCount: evidence.length,
    underlyingWorkCount: works.size,
    independentSupportCount: independentKeys.size,
    primarySourceCount,
    secondaryIndependentCount,
    syndicationAdjustedCount,
    explanationCodes,
  };
}
