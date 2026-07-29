import { z } from "zod";
import { EvidenceDepthSchema, SourceAccessTypeSchema, SourceEvidenceRoleSchema } from "./source";
import { PodcastTranscriptStatusSchema } from "./source-content";
import { RawContentTypeSchema } from "./raw-source-record";
import {
  NormalizationConfidenceSchema,
  NormalizationReviewStatusSchema,
  ProvenanceReferenceSchema,
} from "./normalization-decision";

export const NormalizedSourceRecordSchema = z.object({
  normalizedRecordId: z.string().min(1),
  contributingRawRecordIds: z.array(z.string().min(1)).min(1),
  canonicalUrl: z.url(),
  normalizedPublisher: z.string().min(1),
  sourceFamilyId: z.string().min(1),
  sourceRole: SourceEvidenceRoleSchema,
  contentType: RawContentTypeSchema,
  normalizedHeadline: z.string().min(1),
  normalizedAuthors: z.array(z.string().min(1)),
  publishedAt: z.iso.datetime(),
  latestUpdatedAt: z.iso.datetime(),
  language: z.string().min(2),
  accessType: SourceAccessTypeSchema,
  evidenceDepth: EvidenceDepthSchema,
  textAvailable: z.boolean(),
  podcastTranscriptStatus: PodcastTranscriptStatusSchema,
  articleVersionId: z.string().min(1),
  underlyingWorkId: z.string().min(1),
  syndicationFamilyId: z.string().min(1).optional(),
  exactDuplicateGroupId: z.string().min(1).optional(),
  nearDuplicateGroupId: z.string().min(1).optional(),
  normalizationConfidence: NormalizationConfidenceSchema,
  reviewStatus: NormalizationReviewStatusSchema,
  decisionCodes: z.array(z.string().min(1)).min(1),
  provenanceReferences: z.array(ProvenanceReferenceSchema).min(1),
  fixtureStatus: z.enum(["fixture", "demonstration"]),
  rulesVersion: z.string().regex(/^normalization-v\d+$/),
});

export type NormalizedSourceRecord = z.infer<typeof NormalizedSourceRecordSchema>;
