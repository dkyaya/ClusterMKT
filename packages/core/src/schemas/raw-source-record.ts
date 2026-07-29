import { z } from "zod";
import { SourceAccessTypeSchema, SourceEvidenceRoleSchema } from "./source";
import { PodcastTranscriptStatusSchema } from "./source-content";
import { TermsReviewStatusSchema } from "./source-registry";

export const RawContentTypeSchema = z.enum([
  "article",
  "press_release",
  "regulatory_filing",
  "government_release",
  "research_note",
  "podcast_episode",
  "podcast_transcript",
  "video",
  "other",
]);

export const RawSourceRecordSchema = z
  .object({
    rawRecordId: z.string().min(1),
    sourceRegistryId: z.string().min(1),
    sourceFamilyId: z.string().min(1).optional(),
    originalUrl: z.string().min(1),
    retrievedUrl: z.string().min(1).optional(),
    sourceCanonicalUrlClaim: z.string().min(1).optional(),
    headline: z.string().min(1),
    subtitle: z.string().min(1).optional(),
    publisherAbstract: z.string().min(1).optional(),
    authorNames: z.array(z.string().min(1)).optional(),
    publishedAt: z.iso.datetime().optional(),
    updatedAt: z.iso.datetime().optional(),
    retrievedAt: z.iso.datetime(),
    language: z.string().min(2),
    contentType: RawContentTypeSchema,
    accessType: SourceAccessTypeSchema,
    paywallStatus: z.enum(["none", "possible", "confirmed", "unknown"]),
    sourceRole: SourceEvidenceRoleSchema,
    rawTickerTags: z.array(z.string().min(1)).optional(),
    rawCompanyTags: z.array(z.string().min(1)).optional(),
    rawSectorTags: z.array(z.string().min(1)).optional(),
    podcastMetadata: z
      .object({
        showName: z.string().min(1),
        episodeId: z.string().min(1).optional(),
        durationSeconds: z.number().int().nonnegative().optional(),
      })
      .optional(),
    transcriptStatus: PodcastTranscriptStatusSchema,
    contentChecksum: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
    metadataChecksum: z.string().regex(/^[a-f0-9]{64}$/),
    sourceProvidedArticleId: z.string().min(1).optional(),
    feedEntryId: z.string().min(1).optional(),
    originalMetadataPayloadRef: z.string().min(1),
    termsReviewStatus: TermsReviewStatusSchema,
    textAvailable: z.boolean(),
    metadataOnly: z.boolean(),
    fixtureStatus: z.enum(["fixture", "demonstration"]),
    fixtureText: z.string().min(1).optional(),
  })
  .superRefine((value, context) => {
    if (value.metadataOnly && value.textAvailable) {
      context.addIssue({ code: "custom", message: "A metadata-only record cannot claim text." });
    }
    if (value.textAvailable && !value.fixtureText && !value.publisherAbstract) {
      context.addIssue({ code: "custom", message: "Text availability requires preserved text." });
    }
    if (value.contentType === "podcast_transcript" && value.transcriptStatus === "unavailable") {
      context.addIssue({ code: "custom", message: "A transcript record cannot be unavailable." });
    }
  });

export type RawSourceRecord = z.infer<typeof RawSourceRecordSchema>;
export type RawContentType = z.infer<typeof RawContentTypeSchema>;
