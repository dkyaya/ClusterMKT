import type { ClaimType } from "../schemas/claim";
import type { ClaimEvidence } from "../schemas/claim-evidence";

export interface EvidenceEligibilityResult {
  eligible: boolean;
  explanationCodes: string[];
  limitation?: string;
}

export function evaluateEvidenceEligibility(
  evidence: ClaimEvidence,
  claimType: ClaimType,
): EvidenceEligibilityResult {
  const depth = evidence.evidenceDepth;
  if (depth === "related_listening_only") {
    return {
      eligible: false,
      explanationCodes: ["RELATED_LISTENING_NOT_FACTUAL_EVIDENCE"],
      limitation: "Podcast metadata without a reviewed transcript is related listening only.",
    };
  }
  if (["headline_only", "metadata"].includes(depth)) {
    const eligible = claimType === "background_context" && depth === "headline_only";
    return {
      eligible,
      explanationCodes: [
        eligible ? "HEADLINE_TOPIC_ONLY" : "METADATA_CANNOT_SUPPORT_DETAILED_CLAIM",
      ],
      limitation: "Headline and metadata evidence cannot support detailed factual claims.",
    };
  }
  if (depth === "publisher_abstract" && !evidence.supportingSpan) {
    return {
      eligible: false,
      explanationCodes: ["ABSTRACT_DETAIL_ABSENT"],
      limitation: "Only statements explicitly present in the abstract may be used.",
    };
  }
  return {
    eligible: evidence.acceptedForClaim,
    explanationCodes: [
      evidence.primary ? "PRIMARY_SOURCE_STATEMENT" : "ACCESSIBLE_EVIDENCE_SUPPORT",
    ],
  };
}
