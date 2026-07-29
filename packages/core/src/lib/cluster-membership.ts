import type { EventSignature } from "../schemas/event-signature";
import type { NormalizedSourceRecord } from "../schemas/normalized-source-record";
import {
  ClusterMembershipDecisionSchema,
  type ClusterMembershipDecision,
} from "../schemas/cluster-membership";
import { explainClusterBoundary } from "./cluster-boundary";
import { compareClusterEvents } from "./cluster-similarity";

export function decideClusterMembership(input: {
  candidateClusterId: string;
  seedEvent: EventSignature;
  record: NormalizedSourceRecord;
  recordEvent: EventSignature;
  backgroundContext?: boolean;
  multiEventRecord?: boolean;
  articleVersionDuplicate?: boolean;
  syndicatedDuplicate?: boolean;
}): ClusterMembershipDecision {
  const comparison = compareClusterEvents(input.seedEvent, input.recordEvent);
  const codes = [...comparison.explanationCodes];
  let membershipStatus: ClusterMembershipDecision["membershipStatus"] = "rejected";
  let reviewStatus: ClusterMembershipDecision["reviewStatus"] = "rejected";
  let confidence: ClusterMembershipDecision["confidence"] = "high";

  if (input.record.reviewStatus === "quarantined") {
    membershipStatus = "quarantined";
    reviewStatus = "quarantined";
    codes.push("quarantined_source_record");
  } else if (input.multiEventRecord) {
    membershipStatus = "review_required";
    reviewStatus = "review_required";
    confidence = "low";
    codes.push("multi_event_record", "review_required_ambiguity");
  } else if (input.backgroundContext) {
    membershipStatus = "related_context";
    reviewStatus = "accepted";
    confidence = "medium";
    codes.push("background_context_only");
  } else if (comparison.compatible || codes.includes("market_reaction_to_event")) {
    membershipStatus = "accepted";
    reviewStatus = input.record.reviewStatus === "review_required" ? "review_required" : "accepted";
    confidence = reviewStatus === "accepted" ? "high" : "medium";
    if (input.articleVersionDuplicate) codes.push("article_version_duplicate", "compatible_update");
    if (input.syndicatedDuplicate) codes.push("syndicated_duplicate");
    if (["metadata-only"].includes(input.record.evidenceDepth)) {
      codes.push("metadata_insufficient");
      confidence = "medium";
    }
  } else if (comparison.supportingFields.includes("primaryEntityIds")) {
    membershipStatus = "related_context";
    reviewStatus = "accepted";
    confidence = "medium";
  }

  return ClusterMembershipDecisionSchema.parse({
    normalizedRecordId: input.record.normalizedRecordId,
    clusterCandidateId: input.candidateClusterId,
    membershipStatus,
    explanationCodes: [...new Set(codes.length ? codes : ["different_event_type"])],
    confidence,
    reviewStatus,
    supportingFields: comparison.supportingFields,
    conflictingFields: comparison.conflictingFields,
    eventBoundaryRationale: explainClusterBoundary(input.seedEvent, input.recordEvent),
    rulesVersion: input.record.rulesVersion,
  });
}
