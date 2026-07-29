import { z } from "zod";

export const RetrievalMethodSchema = z.enum([
  "fixture_rss",
  "fixture_api",
  "fixture_filing",
  "fixture_podcast_rss",
  "fixture_transcript",
  "fixture_file",
  "prohibited_scrape",
]);

export const RetrievalMethodConfigSchema = z.object({
  method: RetrievalMethodSchema,
  adapterId: z.string().min(1),
  enabledForFixture: z.boolean(),
  reviewed: z.boolean(),
  endpointClass: z.string().min(1),
  notes: z.string().min(1),
});

export type RetrievalMethod = z.infer<typeof RetrievalMethodSchema>;
export type RetrievalMethodConfig = z.infer<typeof RetrievalMethodConfigSchema>;
