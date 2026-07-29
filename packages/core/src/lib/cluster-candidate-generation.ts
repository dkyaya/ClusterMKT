import type { ClusterCandidateGenerationResult, ClusterCandidateInput } from "../types/clustering";
import { decideClusterMembership } from "./cluster-membership";

export function generateClusterCandidateMembership(
  input: ClusterCandidateInput,
): ClusterCandidateGenerationResult {
  const membershipDecisions = input.records.map(({ record, event }) =>
    decideClusterMembership({
      candidateClusterId: input.candidateClusterId,
      seedEvent: input.seedEvent,
      record,
      recordEvent: event,
    }),
  );
  const ids = (status: (typeof membershipDecisions)[number]["membershipStatus"]) =>
    membershipDecisions
      .filter((decision) => decision.membershipStatus === status)
      .map((decision) => decision.normalizedRecordId);
  return {
    membershipDecisions,
    acceptedRecordIds: ids("accepted"),
    relatedContextRecordIds: ids("related_context"),
    rejectedRecordIds: ids("rejected"),
    reviewRequiredRecordIds: ids("review_required"),
    quarantinedRecordIds: ids("quarantined"),
  };
}
