import { z } from "zod";
import { ClusterScopeSchema, ConfidenceLevelSchema } from "./cluster-entity-relation";
import { ClusterMembershipDecisionSchema } from "./cluster-membership";
import { ClusterReviewStatusSchema } from "./cluster-review";
import { EventTypeSchema } from "./event-signature";

export const StoryClusterCandidateSchema = z.object({
  candidateClusterId: z.string().regex(/^candidate-[a-z0-9-]+$/),
  eventSignatureId: z.string().min(1),
  primaryEventType: EventTypeSchema,
  primaryEntityIds: z.array(z.string().min(1)).min(1),
  secondaryEntityIds: z.array(z.string().min(1)),
  sectorId: z.string().min(1).optional(),
  subindustryIds: z.array(z.string().min(1)),
  macroTopicIds: z.array(z.string().min(1)),
  geography: z.string().min(1).optional(),
  firstSeenAt: z.iso.datetime(),
  latestUpdatedAt: z.iso.datetime(),
  normalizedSourceRecordIds: z.array(z.string().min(1)).min(1),
  underlyingWorkIds: z.array(z.string().min(1)).min(1),
  independentSourceFamilyIds: z.array(z.string().min(1)),
  syndicationFamilyIds: z.array(z.string().min(1)),
  primarySourceIds: z.array(z.string().min(1)),
  metadataOnlySourceIds: z.array(z.string().min(1)),
  transcriptBackedPodcastIds: z.array(z.string().min(1)),
  relatedListeningOnlyPodcastIds: z.array(z.string().min(1)),
  candidateScope: ClusterScopeSchema,
  membershipDecisions: z.array(ClusterMembershipDecisionSchema).min(1),
  candidateTitle: z.string().min(1),
  candidateShortOverview: z.string().min(1),
  candidateWhyItMatters: z.string().min(1),
  claimIds: z.array(z.string().min(1)),
  agreementGroupIds: z.array(z.string().min(1)),
  disagreementGroupIds: z.array(z.string().min(1)),
  uncertaintyIds: z.array(z.string().min(1)),
  coverageGaps: z.array(z.string().min(1)),
  clusterConfidence: ConfidenceLevelSchema,
  reviewStatus: ClusterReviewStatusSchema,
  reviewReasons: z.array(z.string().min(1)),
  rulesVersion: z.string().regex(/^normalization-v\d+$/),
  fixtureStatus: z.enum(["fixture", "demonstration"]),
});

export type StoryClusterCandidate = z.infer<typeof StoryClusterCandidateSchema>;
