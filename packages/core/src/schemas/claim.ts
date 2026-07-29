import { z } from "zod";
import { ConfidenceLevelSchema } from "./cluster-entity-relation";
import { ClaimEvidenceDepthSchema } from "./claim-evidence";
import { ClusterReviewStatusSchema } from "./cluster-review";
import { EventTypeSchema } from "./event-signature";

export const ClaimTypeSchema = z.enum([
  "event_fact",
  "quantitative_fact",
  "temporal_fact",
  "entity_relation",
  "policy_fact",
  "company_statement",
  "market_reaction",
  "causal_interpretation",
  "analyst_interpretation",
  "background_context",
  "uncertainty",
  "future_resolution_condition",
]);
export const ClaimStatusSchema = z.enum([
  "supported",
  "partially_supported",
  "disputed",
  "unsupported",
  "metadata_only",
  "quarantined",
]);
export const QuantitativeValueSchema = z.object({
  rawValueText: z.string().min(1),
  numericValue: z.number().finite().optional(),
  unit: z.string().min(1).optional(),
  currency: z.string().length(3).optional(),
  scale: z.enum(["ones", "thousands", "millions", "billions"]).optional(),
  percentageBasis: z.string().min(1).optional(),
  timePeriod: z.string().min(1).optional(),
  precision: z.enum(["exact", "approximate", "range", "threshold"]),
  sourceSpecificRounding: z.string().min(1).optional(),
});

export const ClaimSchema = z.object({
  claimId: z.string().regex(/^claim-[a-z0-9-]+$/),
  clusterCandidateId: z.string().min(1),
  claimType: ClaimTypeSchema,
  claimText: z.string().min(1),
  normalizedProposition: z.string().min(1),
  subjectEntityIds: z.array(z.string().min(1)),
  predicate: z.string().min(1),
  object: z.string().min(1).optional(),
  eventType: EventTypeSchema.optional(),
  timeScope: z.string().min(1).optional(),
  geography: z.string().min(1).optional(),
  quantitativeValues: z.array(QuantitativeValueSchema),
  direction: z.string().min(1).optional(),
  certaintyLanguage: z.string().min(1).optional(),
  attribution: z.string().min(1).optional(),
  evidenceIds: z.array(z.string().min(1)),
  independentSupportCount: z.number().int().nonnegative(),
  supportingUnderlyingWorkIds: z.array(z.string().min(1)),
  supportingSourceFamilyIds: z.array(z.string().min(1)),
  contradictingEvidenceIds: z.array(z.string().min(1)),
  evidenceDepth: ClaimEvidenceDepthSchema,
  claimStatus: ClaimStatusSchema,
  confidence: ConfidenceLevelSchema,
  reviewStatus: ClusterReviewStatusSchema,
  explanationCodes: z.array(z.string().min(1)).min(1),
  rulesVersion: z.string().regex(/^normalization-v\d+$/),
  fixtureStatus: z.enum(["fixture", "demonstration"]),
});

export type ClaimType = z.infer<typeof ClaimTypeSchema>;
export type ClaimStatus = z.infer<typeof ClaimStatusSchema>;
export type QuantitativeValue = z.infer<typeof QuantitativeValueSchema>;
export type Claim = z.infer<typeof ClaimSchema>;
