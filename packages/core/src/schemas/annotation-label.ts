import { z } from "zod";

export const AnnotationTaskTypeSchema = z.enum([
  "source_normalization",
  "entity_resolution",
  "event_boundaries",
  "story_cluster_membership",
  "claims",
  "agreement_disagreement",
  "review_routing",
  "sector_coverage",
]);

export const ReviewerConfidenceSchema = z.enum(["low", "medium", "high"]);

export const AnnotationLabelSchema = z.object({
  labelId: z.string().regex(/^label-[a-z0-9-]+$/),
  task: AnnotationTaskTypeSchema,
  value: z.string().min(1),
  definition: z.string().min(1),
  objectiveClass: z.enum(["objective", "judgment_based", "mixed"]),
  orderedRank: z.number().int().nonnegative().optional(),
  critical: z.boolean(),
});

export type AnnotationTaskType = z.infer<typeof AnnotationTaskTypeSchema>;
export type AnnotationLabel = z.infer<typeof AnnotationLabelSchema>;
export type ReviewerConfidence = z.infer<typeof ReviewerConfidenceSchema>;
