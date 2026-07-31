import { z } from "zod";
import { AnnotationTaskTypeSchema, ReviewerConfidenceSchema } from "./annotation-label";

export const DecisionAmendmentSchema = z.object({
  amendmentId: z.string().min(1),
  priorDecisionChecksum: z.string().min(8),
  priorLabelIds: z.array(z.string().regex(/^label-[a-z0-9-]+$/)),
  replacementLabelIds: z.array(z.string().regex(/^label-[a-z0-9-]+$/)),
  reason: z.string().min(1),
  amendedBy: z.string().regex(/^reviewer-[a-z0-9-]+$/),
  amendedAt: z.iso.datetime(),
});

export const ReviewerDecisionSchema = z.object({
  decisionId: z.string().regex(/^decision-[a-z0-9-]+$/),
  assignmentId: z.string().regex(/^assignment-[a-z0-9-]+$/),
  itemId: z.string().regex(/^gold-item-\d{4}$/),
  task: AnnotationTaskTypeSchema,
  reviewerId: z.string().regex(/^reviewer-[a-z0-9-]+$/),
  selectedLabelIds: z.array(z.string().regex(/^label-[a-z0-9-]+$/)),
  cannotDetermine: z.boolean(),
  insufficientEvidence: z.boolean(),
  confidence: ReviewerConfidenceSchema,
  notes: z.string(),
  evidenceCitations: z.array(z.string().min(1)),
  predictionVisibleAtSubmission: z.literal(false),
  peerDecisionsVisibleAtSubmission: z.literal(false),
  adjudicationVisibleAtSubmission: z.literal(false),
  submittedAt: z.iso.datetime(),
  amendments: z.array(DecisionAmendmentSchema),
  status: z.enum(["submitted", "amended", "withdrawn"]),
});

export type ReviewerDecision = z.infer<typeof ReviewerDecisionSchema>;
