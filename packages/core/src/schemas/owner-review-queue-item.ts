import { z } from "zod";
import { AnnotationTaskTypeSchema } from "./annotation-label";

export const OwnerEscalationStatusSchema = z.enum([
  "not_required",
  "recommended",
  "required_before_calibration",
  "required_before_display",
  "owner_confirmed",
  "owner_overridden",
  "owner_deferred",
]);

export const OwnerReviewQueueItemSchema = z.object({
  queueItemId: z.string().regex(/^owner-queue-[a-f0-9]{12}$/),
  panelId: z.string().regex(/^agent-panel-[a-f0-9]{12}$/),
  task: AnnotationTaskTypeSchema,
  status: OwnerEscalationStatusSchema,
  reasons: z.array(z.string().min(1)).min(1),
  createdAt: z.iso.datetime(),
  resolvedAt: z.iso.datetime().nullable(),
  resolutionNotes: z.string().nullable(),
});

export type OwnerEscalationStatus = z.infer<typeof OwnerEscalationStatusSchema>;
export type OwnerReviewQueueItem = z.infer<typeof OwnerReviewQueueItemSchema>;
