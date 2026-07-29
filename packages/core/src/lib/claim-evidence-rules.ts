import type { ClaimType } from "../schemas/claim";
import type { ClaimEvidence } from "../schemas/claim-evidence";
import { evaluateEvidenceEligibility } from "./evidence-eligibility";

export function validateClaimEvidenceUsage(claimType: ClaimType, evidence: ClaimEvidence[]) {
  const decisions = evidence.map((item) => ({
    evidenceId: item.evidenceId,
    ...evaluateEvidenceEligibility(item, claimType),
  }));
  return {
    decisions,
    acceptedEvidenceIds: decisions
      .filter((decision) => decision.eligible)
      .map((item) => item.evidenceId),
    rejectedEvidenceIds: decisions
      .filter((decision) => !decision.eligible)
      .map((item) => item.evidenceId),
    compliant: decisions.some((decision) => decision.eligible),
  };
}
