import { z } from "zod";

export const NormalizationConfidenceSchema = z.enum(["high", "medium", "low"]);
export const NormalizationReviewStatusSchema = z.enum([
  "accepted",
  "review_required",
  "rejected",
  "quarantined",
]);
export const NormalizationStageSchema = z.enum([
  "raw_validation",
  "url_normalization",
  "text_normalization",
  "source_family",
  "exact_duplicate",
  "format_variant",
  "syndication",
  "article_version",
  "entity_candidate_generation",
  "entity_resolution",
  "event_signature",
  "event_relationship",
  "normalized_record",
  "routing",
]);

export const ProvenanceReferenceSchema = z.object({
  rawRecordId: z.string().min(1),
  field: z.string().min(1),
  payloadRef: z.string().min(1),
});

export const NormalizationDecisionSchema = z.object({
  decisionId: z.string().min(1),
  stage: NormalizationStageSchema,
  inputIds: z.array(z.string().min(1)).min(1),
  outputIds: z.array(z.string().min(1)),
  ruleIds: z.array(z.string().min(1)).min(1),
  explanation: z.string().min(1),
  explanationCodes: z.array(z.string().min(1)).min(1),
  confidence: NormalizationConfidenceSchema,
  reviewStatus: NormalizationReviewStatusSchema,
  processedAt: z.iso.datetime(),
  rulesVersion: z.string().regex(/^normalization-v\d+$/),
  provenance: z.array(ProvenanceReferenceSchema).min(1),
});

export type NormalizationConfidence = z.infer<typeof NormalizationConfidenceSchema>;
export type NormalizationReviewStatus = z.infer<typeof NormalizationReviewStatusSchema>;
export type NormalizationDecision = z.infer<typeof NormalizationDecisionSchema>;
export type ProvenanceReference = z.infer<typeof ProvenanceReferenceSchema>;
