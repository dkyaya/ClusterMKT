import { z } from "zod";
import { ProvenanceReferenceSchema } from "./normalization-decision";

export const ArticleRelationshipSchema = z.enum([
  "exact_duplicate",
  "format_variant",
  "syndicated_copy",
  "updated_version",
  "materially_revised_version",
  "new_article_same_event",
  "new_event_same_entity",
]);

export const ArticleVersionSchema = z.object({
  articleVersionId: z.string().min(1),
  underlyingWorkId: z.string().min(1),
  versionNumber: z.number().int().positive(),
  predecessorVersionId: z.string().min(1).optional(),
  firstSeenAt: z.iso.datetime(),
  latestSeenAt: z.iso.datetime(),
  changedFields: z.array(z.string().min(1)),
  materialChange: z.boolean(),
  superseded: z.boolean(),
  relationship: ArticleRelationshipSchema,
  explanationCodes: z.array(z.string().min(1)).min(1),
  provenance: z.array(ProvenanceReferenceSchema).min(1),
  rulesVersion: z.string().regex(/^normalization-v\d+$/),
});

export type ArticleVersion = z.infer<typeof ArticleVersionSchema>;
export type ArticleRelationship = z.infer<typeof ArticleRelationshipSchema>;
