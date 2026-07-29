import { z } from "zod";

export const SourceEvidenceRoleSchema = z.enum(["primary", "secondary", "related"]);
export const EvidenceDepthSchema = z.enum([
  "full-text",
  "authorized-abstract",
  "metadata-only",
  "transcript",
]);
export const SourceAccessTypeSchema = z.enum(["public", "registration", "subscription", "unknown"]);
export const RelevanceLabelSchema = z.enum(["high", "moderate", "context"]);

export const SourcePublisherSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().min(1).optional(),
});

const sourceBase = z.object({
  id: z.string().min(1),
  publisher: SourcePublisherSchema,
  title: z.string().min(1),
  publishedAt: z.iso.datetime(),
  accessType: SourceAccessTypeSchema,
  evidenceRole: SourceEvidenceRoleSchema,
  evidenceDepth: EvidenceDepthSchema,
  relevance: RelevanceLabelSchema,
  whyIncluded: z.string().min(1),
  usedInOverview: z.boolean(),
  url: z.url().optional(),
});

export const ArticleSourceSchema = sourceBase.extend({ kind: z.literal("article") });
export const SourceItemSchema = z.discriminatedUnion("kind", [ArticleSourceSchema]);

export type SourcePublisher = z.infer<typeof SourcePublisherSchema>;
export type SourceItem = z.infer<typeof SourceItemSchema>;
export type ArticleSource = z.infer<typeof ArticleSourceSchema>;
export type SourceEvidenceRole = z.infer<typeof SourceEvidenceRoleSchema>;
export type EvidenceDepth = z.infer<typeof EvidenceDepthSchema>;
export type SourceAccessType = z.infer<typeof SourceAccessTypeSchema>;
export type RelevanceLabel = z.infer<typeof RelevanceLabelSchema>;
