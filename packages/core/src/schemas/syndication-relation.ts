import { z } from "zod";
import {
  NormalizationConfidenceSchema,
  NormalizationReviewStatusSchema,
} from "./normalization-decision";

export const SyndicationRelationshipSchema = z.enum([
  "original",
  "attributed_republication",
  "distribution_copy",
  "independent_reporting",
  "review_required",
]);

export const SyndicationRelationSchema = z.object({
  leftRawRecordId: z.string().min(1),
  rightRawRecordId: z.string().min(1),
  relationship: SyndicationRelationshipSchema,
  underlyingWorkId: z.string().min(1).optional(),
  syndicationFamilyId: z.string().min(1).optional(),
  confidence: NormalizationConfidenceSchema,
  explanationCodes: z.array(z.string().min(1)).min(1),
  reviewStatus: NormalizationReviewStatusSchema,
  countsAsIndependentConfirmation: z.boolean(),
  rulesVersion: z.string().regex(/^normalization-v\d+$/),
});

export type SyndicationRelation = z.infer<typeof SyndicationRelationSchema>;
