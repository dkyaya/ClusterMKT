import { z } from "zod";
import { AnnotationTaskTypeSchema } from "./annotation-label";

export const SamplingMinimumSchema = z.object({
  dimension: z.string().min(1),
  value: z.string().min(1),
  minimum: z.number().int().nonnegative(),
});

export const SamplingPlanSchema = z.object({
  samplingPlanVersion: z.string().regex(/^sampling-v\d+$/),
  corpusVersion: z.string().regex(/^gold-corpus-v\d+$/),
  deterministicSeed: z.string().min(1),
  targetItemCount: z.number().int().min(300),
  taskMinimums: z.record(AnnotationTaskTypeSchema, z.number().int().nonnegative()),
  strataMinimums: z.array(SamplingMinimumSchema),
  maximumCompanyShare: z.number().min(0).max(1),
  partitionRatios: z.object({
    training: z.number().min(0).max(1),
    calibration: z.number().min(0).max(1),
    heldOut: z.number().min(0).max(1),
  }),
});

export type SamplingPlan = z.infer<typeof SamplingPlanSchema>;
