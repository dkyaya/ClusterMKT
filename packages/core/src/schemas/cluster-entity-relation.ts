import { z } from "zod";

export const ClusterScopeSchema = z.enum([
  "sector_wide",
  "company_led_sector_impact",
  "macro_to_sector",
  "company_specific",
]);

export const RelationTypeSchema = z.enum([
  "subject",
  "affected",
  "constituent",
  "supply_chain",
  "macro_driver",
  "regulator",
]);
export const ConfidenceLevelSchema = z.enum(["low", "medium", "high"]);
export const RelationReviewStatusSchema = z.enum(["accepted", "review_required", "rejected"]);
export const AffectedDimensionSchema = z.enum([
  "demand",
  "supply",
  "pricing",
  "capacity",
  "financing",
  "regulation",
  "labor",
  "currency",
  "energy",
]);

export const ClusterEntityRelationSchema = z
  .object({
    clusterId: z.string().regex(/^cluster-[a-z0-9-]+$/),
    entityId: z.string().min(1),
    relationshipType: RelationTypeSchema,
    clusterScope: ClusterScopeSchema,
    materialityScore: z.number().min(0).max(100),
    relevanceScore: z.number().min(0).max(100),
    confidenceLevel: ConfidenceLevelSchema,
    whyRelevant: z.string().min(1),
    supportingSourceIds: z.array(z.string().min(1)),
    directlyNamed: z.boolean(),
    inferred: z.boolean(),
    affectedDimensions: z.array(AffectedDimensionSchema),
    reviewStatus: RelationReviewStatusSchema,
  })
  .superRefine((relation, context) => {
    if (relation.reviewStatus === "accepted" && relation.supportingSourceIds.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["supportingSourceIds"],
        message: "Accepted material relations require supporting source IDs.",
      });
    }
  });

export type ClusterEntityRelation = z.infer<typeof ClusterEntityRelationSchema>;
export type ClusterScope = z.infer<typeof ClusterScopeSchema>;
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;
export type RelationReviewStatus = z.infer<typeof RelationReviewStatusSchema>;
