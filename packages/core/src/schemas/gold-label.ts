import { z } from "zod";
import { AnnotationTaskTypeSchema, ReviewerConfidenceSchema } from "./annotation-label";
import { DecisionAmendmentSchema } from "./reviewer-decision";

export const GoldLabelSchema = z.object({
  goldLabelId: z.string().regex(/^gold-label-[a-z0-9-]+$/),
  itemId: z.string().regex(/^gold-item-\d{4}$/),
  corpusVersion: z.string().regex(/^gold-corpus-v\d+$/),
  task: AnnotationTaskTypeSchema,
  finalLabelIds: z.array(z.string().min(1)).min(1),
  adjudicationId: z.string().min(1),
  independentReviewerDecisionIds: z.array(z.string().min(1)).min(2),
  confidence: ReviewerConfidenceSchema,
  provenance: z.array(z.string().min(1)).min(1),
  finalizedAt: z.iso.datetime(),
  finalizedBy: z.string().regex(/^reviewer-[a-z0-9-]+$/),
  amendments: z.array(DecisionAmendmentSchema),
  status: z.enum(["final", "amended", "withdrawn"]),
});

export type GoldLabel = z.infer<typeof GoldLabelSchema>;
