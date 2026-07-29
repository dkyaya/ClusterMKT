import { z } from "zod";

export const SourceTextAvailabilitySchema = z.enum([
  "none",
  "headline_only",
  "abstract",
  "full_text",
  "transcript",
]);

export const PodcastTranscriptStatusSchema = z.enum([
  "not_applicable",
  "unavailable",
  "metadata_only",
  "available_unreviewed",
  "reviewed_permitted",
]);

export const SourceContentSchema = z
  .object({
    availability: SourceTextAvailabilitySchema,
    headline: z.string().min(1),
    subtitle: z.string().min(1).optional(),
    publisherAbstract: z.string().min(1).optional(),
    fixtureText: z.string().min(1).optional(),
    transcriptStatus: PodcastTranscriptStatusSchema.default("not_applicable"),
  })
  .superRefine((value, context) => {
    if (value.availability === "abstract" && !value.publisherAbstract) {
      context.addIssue({ code: "custom", message: "Abstract availability requires an abstract." });
    }
    if (["full_text", "transcript"].includes(value.availability) && !value.fixtureText) {
      context.addIssue({ code: "custom", message: "Available text requires fixture text." });
    }
  });

export type SourceContent = z.infer<typeof SourceContentSchema>;
export type SourceTextAvailability = z.infer<typeof SourceTextAvailabilitySchema>;
export type PodcastTranscriptStatus = z.infer<typeof PodcastTranscriptStatusSchema>;
