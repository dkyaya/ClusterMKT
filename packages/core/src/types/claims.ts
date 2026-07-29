import type { Claim } from "../schemas/claim";
import type { ClaimEvidence } from "../schemas/claim-evidence";

export interface StructuredClaimAnnotation {
  claimId: string;
  clusterCandidateId: string;
  claimText: string;
  normalizedProposition: string;
  subjectEntityIds: string[];
  predicate: string;
  object?: string;
  evidence: ClaimEvidence[];
  claim: Omit<
    Claim,
    | "claimId"
    | "clusterCandidateId"
    | "claimText"
    | "normalizedProposition"
    | "subjectEntityIds"
    | "predicate"
    | "object"
    | "evidenceIds"
    | "independentSupportCount"
    | "supportingUnderlyingWorkIds"
    | "supportingSourceFamilyIds"
  >;
}

export interface IndependentSupportResult {
  rawEvidenceCount: number;
  underlyingWorkCount: number;
  independentSupportCount: number;
  primarySourceCount: number;
  secondaryIndependentCount: number;
  syndicationAdjustedCount: number;
  explanationCodes: string[];
}
