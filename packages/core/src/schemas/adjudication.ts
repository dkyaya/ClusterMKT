import { z } from "zod";
import { AnnotationTaskTypeSchema, ReviewerConfidenceSchema } from "./annotation-label";

export const AdjudicationSchema = z.object({
  adjudicationId: z.string().regex(/^adjudication-[a-z0-9-]+$/),
  itemId: z.string().regex(/^gold-item-\d{4}$/),
  task: AnnotationTaskTypeSchema,
  reviewerDecisionIds: z.array(z.string().min(1)).min(2),
  finalLabelIds: z.array(z.string().min(1)).min(1),
  reason: z.string().min(1),
  evidenceCited: z.array(z.string().min(1)).min(1),
  guidelineClarificationNeeded: z.boolean(),
  regressionFixtureRecommended: z.boolean(),
  thresholdReviewRecommended: z.boolean(),
  confidence: ReviewerConfidenceSchema,
  adjudicatorId: z.string().regex(/^reviewer-[a-z0-9-]+$/),
  adjudicatedAt: z.iso.datetime(),
  unresolved: z.boolean(),
});

export type Adjudication = z.infer<typeof AdjudicationSchema>;
