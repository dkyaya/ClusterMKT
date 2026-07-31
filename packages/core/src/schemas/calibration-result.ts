import { z } from "zod";

export const CalibrationApprovalStatusSchema = z.enum([
  "blocked_pending_human_review",
  "proposed",
  "approved",
  "rejected",
]);

export const CalibrationResultSchema = z.object({
  calibrationVersion: z.string().regex(/^calibration-v\d+$/),
  thresholdId: z.string().min(1),
  trainingCorpusVersion: z.string().min(1),
  calibrationCorpusVersion: z.string().min(1),
  heldOutCorpusVersion: z.string().min(1),
  objective: z.string().min(1),
  oldThreshold: z.number(),
  chosenThreshold: z.number().nullable(),
  alternatives: z.array(
    z.object({
      threshold: z.number(),
      precision: z.number(),
      recall: z.number(),
      criticalFailures: z.number(),
    }),
  ),
  metrics: z.record(z.string(), z.number().nullable()),
  tradeoffs: z.array(z.string().min(1)),
  approvalStatus: CalibrationApprovalStatusSchema,
  blockingReasons: z.array(z.string().min(1)),
});

export type CalibrationResult = z.infer<typeof CalibrationResultSchema>;
