import { ClaimSchema, type Claim } from "../schemas/claim";
import type { StructuredClaimAnnotation } from "../types/claims";
import { validateClaimEvidenceUsage } from "./claim-evidence-rules";
import { countIndependentSupport } from "./independent-support";

export function extractAnnotatedClaim(annotation: StructuredClaimAnnotation): Claim {
  const usage = validateClaimEvidenceUsage(annotation.claim.claimType, annotation.evidence);
  const acceptedEvidence = annotation.evidence.filter((item) =>
    usage.acceptedEvidenceIds.includes(item.evidenceId),
  );
  const support = countIndependentSupport(acceptedEvidence);
  return ClaimSchema.parse({
    ...annotation.claim,
    claimId: annotation.claimId,
    clusterCandidateId: annotation.clusterCandidateId,
    claimText: annotation.claimText,
    normalizedProposition: annotation.normalizedProposition,
    subjectEntityIds: annotation.subjectEntityIds,
    predicate: annotation.predicate,
    ...(annotation.object ? { object: annotation.object } : {}),
    evidenceIds: acceptedEvidence.map((item) => item.evidenceId),
    supportingUnderlyingWorkIds: [
      ...new Set(acceptedEvidence.map((item) => item.underlyingWorkId)),
    ],
    supportingSourceFamilyIds: [...new Set(acceptedEvidence.map((item) => item.sourceFamilyId))],
    independentSupportCount: support.independentSupportCount,
    claimStatus: usage.compliant ? annotation.claim.claimStatus : "unsupported",
    reviewStatus: usage.compliant ? annotation.claim.reviewStatus : "rejected",
    explanationCodes: [
      ...annotation.claim.explanationCodes,
      ...(usage.compliant ? ["ELIGIBLE_EVIDENCE_PRESENT"] : ["NO_ELIGIBLE_EVIDENCE"]),
    ],
  });
}
