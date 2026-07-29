import {
  ClusterPresentationSchema,
  type ClusterPresentation,
} from "../schemas/cluster-presentation";
import type { AgreementGroup } from "../schemas/agreement-group";
import type { Claim } from "../schemas/claim";
import type { ClusterReviewDecision } from "../schemas/cluster-review";
import type { ClusterUncertaintyRecord } from "../schemas/cluster-uncertainty";
import type { DisagreementGroup } from "../schemas/disagreement-group";
import type { StoryClusterCandidate } from "../schemas/story-cluster-candidate";
import { buildClusterOverview } from "./cluster-overview";

export function buildClusterPresentation(input: {
  candidate: StoryClusterCandidate;
  claims: Claim[];
  agreements: AgreementGroup[];
  disagreements: DisagreementGroup[];
  uncertainties: ClusterUncertaintyRecord[];
  review: ClusterReviewDecision;
  relatedStocks: string[];
  relatedSectors: string[];
  relatedThemes: string[];
}): ClusterPresentation {
  const accepted = input.claims.filter(
    (claim) => claim.reviewStatus === "accepted" && claim.claimStatus !== "unsupported",
  );
  return ClusterPresentationSchema.parse({
    clusterCandidateId: input.candidate.candidateClusterId,
    title: input.candidate.candidateTitle,
    shortOverview: buildClusterOverview(accepted),
    whyItMatters: input.candidate.candidateWhyItMatters,
    whatHappenedClaimIds: accepted
      .filter((claim) =>
        [
          "event_fact",
          "quantitative_fact",
          "temporal_fact",
          "policy_fact",
          "company_statement",
        ].includes(claim.claimType),
      )
      .map((claim) => claim.claimId),
    agreementGroupIds: input.agreements.map((group) => group.agreementGroupId),
    disagreementGroupIds: input.disagreements
      .filter((group) => group.disagreementType !== "apparent_only")
      .map((group) => group.disagreementGroupId),
    uncertaintyIds: input.uncertainties.map((item) => item.uncertaintyId),
    resolutionConditionIds: input.uncertainties.map((item) => `resolution-${item.uncertaintyId}`),
    relatedStocks: input.relatedStocks,
    relatedSectors: input.relatedSectors,
    relatedThemes: input.relatedThemes,
    rawSourceCount: input.candidate.normalizedSourceRecordIds.length,
    independentSourceCount: input.candidate.independentSourceFamilyIds.length,
    primarySourceCount: input.candidate.primarySourceIds.length,
    lastUpdatedAt: input.candidate.latestUpdatedAt,
    firstDetectedAt: input.candidate.firstSeenAt,
    reviewStatus: input.review.status,
    rulesVersion: input.candidate.rulesVersion,
  });
}
