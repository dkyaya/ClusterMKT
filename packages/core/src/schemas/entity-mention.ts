import { z } from "zod";
import { EntityTypeSchema } from "./entity";
import {
  NormalizationConfidenceSchema,
  NormalizationReviewStatusSchema,
} from "./normalization-decision";

export const EntityMentionTypeSchema = z.enum([
  "direct_explicit_mention",
  "ticker_mention",
  "product_mention",
  "subsidiary_mention",
  "executive_mention",
  "sector_mention",
  "macro_topic_mention",
  "institution_mention",
  "inferred_relation",
  "incidental_mention",
  "rejected_false_match",
]);

export const EntityMentionSchema = z.object({
  candidateEntityId: z.string().min(1),
  entityType: EntityTypeSchema,
  mentionType: EntityMentionTypeSchema,
  matchedAlias: z.string().min(1),
  field: z.enum(["headline", "abstract", "text", "url", "source_tag"]),
  start: z.number().int().nonnegative().optional(),
  end: z.number().int().positive().optional(),
  direct: z.boolean(),
  inferred: z.boolean(),
  accepted: z.boolean(),
  confidence: NormalizationConfidenceSchema,
  explanationCodes: z.array(z.string().min(1)).min(1),
  reviewStatus: NormalizationReviewStatusSchema,
  supportingRawFields: z.array(z.string().min(1)).min(1),
});

export type EntityMention = z.infer<typeof EntityMentionSchema>;
export type EntityMentionType = z.infer<typeof EntityMentionTypeSchema>;
