import { z } from "zod";
import {
  EvidenceDepthSchema,
  RelevanceLabelSchema,
  SourceAccessTypeSchema,
  SourceEvidenceRoleSchema,
  SourcePublisherSchema,
} from "./source";

export const PodcastSourceSchema = z
  .object({
    kind: z.literal("podcast"),
    id: z.string().min(1),
    publisher: SourcePublisherSchema,
    title: z.string().min(1),
    episodeTitle: z.string().min(1),
    publishedAt: z.iso.datetime(),
    accessType: SourceAccessTypeSchema,
    evidenceRole: SourceEvidenceRoleSchema,
    evidenceDepth: EvidenceDepthSchema,
    relevance: RelevanceLabelSchema,
    whyIncluded: z.string().min(1),
    usedInOverview: z.boolean(),
    transcriptReviewed: z.boolean(),
    relatedListeningOnly: z.boolean(),
    contributedEvidence: z.boolean(),
    url: z.url().optional(),
  })
  .superRefine((podcast, context) => {
    if (podcast.contributedEvidence && !podcast.transcriptReviewed) {
      context.addIssue({
        code: "custom",
        path: ["contributedEvidence"],
        message: "Podcast evidence requires a reviewed, permitted transcript.",
      });
    }
    if (podcast.relatedListeningOnly && podcast.contributedEvidence) {
      context.addIssue({
        code: "custom",
        path: ["relatedListeningOnly"],
        message: "Related listening cannot also be overview evidence.",
      });
    }
  });

export type PodcastSource = z.infer<typeof PodcastSourceSchema>;
