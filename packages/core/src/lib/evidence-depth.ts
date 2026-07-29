import type { ClaimEvidenceDepth } from "../schemas/claim-evidence";

export const EVIDENCE_DEPTH_RANK: Record<ClaimEvidenceDepth, number> = {
  related_listening_only: 0,
  metadata: 1,
  headline_only: 1,
  publisher_abstract: 2,
  quoted_excerpt_fixture: 3,
  primary_release: 4,
  regulatory_filing: 5,
  government_release: 5,
  official_transcript: 5,
  full_fixture_text: 5,
};

export function deepestEvidence(depths: ClaimEvidenceDepth[]): ClaimEvidenceDepth {
  return (
    [...depths].sort((left, right) => EVIDENCE_DEPTH_RANK[right] - EVIDENCE_DEPTH_RANK[left])[0] ??
    "metadata"
  );
}
