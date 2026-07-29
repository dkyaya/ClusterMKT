import type { ClaimEvidence } from "../schemas/claim-evidence";

export function independentEvidenceKey(evidence: ClaimEvidence): string | undefined {
  if (!evidence.acceptedForClaim || evidence.evidenceDepth === "related_listening_only")
    return undefined;
  if (evidence.syndicated) return `syndication:${evidence.underlyingWorkId}`;
  return evidence.independent
    ? `family:${evidence.sourceFamilyId}:work:${evidence.underlyingWorkId}`
    : `work:${evidence.underlyingWorkId}`;
}
