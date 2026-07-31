import { z } from "zod";
import { AnnotationTaskTypeSchema } from "./annotation-label";

export const ReviewerRoleSchema = z.enum([
  "reviewer",
  "senior_reviewer",
  "adjudicator",
  "corpus_manager",
]);

export const ReviewerAssignmentSchema = z.object({
  assignmentId: z.string().regex(/^assignment-[a-z0-9-]+$/),
  itemId: z.string().regex(/^gold-item-\d{4}$/),
  task: AnnotationTaskTypeSchema,
  reviewerId: z.string().regex(/^reviewer-[a-z0-9-]+$/),
  reviewerRole: ReviewerRoleSchema,
  assignmentOrder: z.number().int().positive(),
  predictionVisible: z.literal(false),
  peerDecisionsVisible: z.literal(false),
  adjudicationVisible: z.literal(false),
  assignedAt: z.iso.datetime(),
  dueAt: z.iso.datetime().nullable(),
  status: z.enum(["assigned", "submitted", "withdrawn"]),
});

export type ReviewerAssignment = z.infer<typeof ReviewerAssignmentSchema>;
export type ReviewerRole = z.infer<typeof ReviewerRoleSchema>;
