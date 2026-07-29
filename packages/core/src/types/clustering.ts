import type { ClusterMembershipDecision } from "../schemas/cluster-membership";
import type { EventSignature } from "../schemas/event-signature";
import type { NormalizedSourceRecord } from "../schemas/normalized-source-record";

export interface ClusterCandidateInput {
  seedEvent: EventSignature;
  records: Array<{ record: NormalizedSourceRecord; event: EventSignature }>;
  candidateClusterId: string;
}

export interface ClusterCandidateGenerationResult {
  membershipDecisions: ClusterMembershipDecision[];
  acceptedRecordIds: string[];
  relatedContextRecordIds: string[];
  rejectedRecordIds: string[];
  reviewRequiredRecordIds: string[];
  quarantinedRecordIds: string[];
}
