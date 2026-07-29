import type { Claim } from "../schemas/claim";
import type { ClaimEvidence } from "../schemas/claim-evidence";
import { DisagreementGroupSchema, type DisagreementGroup } from "../schemas/disagreement-group";
import { classifyDisagreement } from "./disagreement-classification";
import { countIndependentSupport } from "./independent-support";

export function detectDisagreement(
  left: Claim,
  right: Claim,
  evidence: ClaimEvidence[],
): DisagreementGroup {
  const classification = classifyDisagreement(left, right);
  const sides = [left, right].map((claim) => {
    const ids = new Set([...claim.evidenceIds, ...claim.contradictingEvidenceIds]);
    return evidence.filter((item) => ids.has(item.evidenceId));
  });
  const oneSideSuperseded = [left, right].some((claim) =>
    claim.explanationCodes.includes("SUPERSEDED_BY_CORRECTION"),
  );
  return DisagreementGroupSchema.parse({
    disagreementGroupId: `disagreement-${left.claimId}-${right.claimId}`,
    claimIds: [left.claimId, right.claimId],
    competingPropositions: [left.normalizedProposition, right.normalizedProposition],
    disagreementType: oneSideSuperseded ? "source_update" : classification.type,
    supportingEvidenceBySide: sides.map((side) => side.map((item) => item.evidenceId)),
    independentSourceCountsBySide: sides.map(
      (side) => countIndependentSupport(side).independentSupportCount,
    ),
    primarySourcePresenceBySide: sides.map((side) => side.some((item) => item.primary)),
    oneSideSuperseded,
    reconcilable: oneSideSuperseded || classification.reconcilable,
    resolutionStatus: oneSideSuperseded
      ? "superseded"
      : classification.reconcilable
        ? "reconciled"
        : "open",
    reviewStatus: classification.type === "unknown" ? "review_required" : "accepted",
    explanationCodes: oneSideSuperseded
      ? ["SUPERSEDED_SOURCE_UPDATE"]
      : classification.explanationCodes,
    rulesVersion: left.rulesVersion,
  });
}
