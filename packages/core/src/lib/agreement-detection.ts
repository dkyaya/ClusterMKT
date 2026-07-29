import { AgreementGroupSchema, type AgreementGroup } from "../schemas/agreement-group";
import type { Claim } from "../schemas/claim";
import type { ClaimEvidence } from "../schemas/claim-evidence";
import { groupEquivalentClaims } from "./claim-grouping";
import { countIndependentSupport } from "./independent-support";
import { determineAgreementStrength } from "./consensus-strength";

export function detectAgreementGroups(
  claims: Claim[],
  evidence: ClaimEvidence[],
): AgreementGroup[] {
  return groupEquivalentClaims(claims).map((group, index) => {
    const canonical = group[0];
    if (!canonical) throw new Error("Agreement groups require at least one claim.");
    const evidenceIds = new Set(group.flatMap((claim) => claim.evidenceIds));
    const supporting = evidence.filter((item) => evidenceIds.has(item.evidenceId));
    const support = countIndependentSupport(supporting);
    const depths = supporting.reduce<Record<string, number>>((result, item) => {
      result[item.evidenceDepth] = (result[item.evidenceDepth] ?? 0) + 1;
      return result;
    }, {});
    return AgreementGroupSchema.parse({
      agreementGroupId: `agreement-${index + 1}`,
      canonicalClaimId: canonical.claimId,
      supportingClaimIds: group.map((claim) => claim.claimId),
      independentSourceFamilyIds: [
        ...new Set(
          supporting
            .filter((item) => item.independent && !item.syndicated)
            .map((item) => item.sourceFamilyId),
        ),
      ],
      primarySourcePresent: supporting.some((item) => item.primary),
      evidenceDepthDistribution: depths,
      agreementStrength: determineAgreementStrength({
        independentSourceCount: support.independentSupportCount,
        primarySourcePresent: supporting.some((item) => item.primary),
      }),
      qualification:
        support.independentSupportCount <= 1
          ? "Limited to one independent underlying work; not consensus."
          : "Equivalent propositions are independently supported without erasing qualifications.",
      reviewStatus: "accepted",
      explanationCodes: support.explanationCodes,
      rulesVersion: canonical.rulesVersion,
    });
  });
}
