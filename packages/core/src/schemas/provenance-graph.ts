import { z } from "zod";

export const ProvenanceNodeTypeSchema = z.enum([
  "raw_record",
  "normalized_record",
  "underlying_work",
  "claim_evidence",
  "claim",
  "agreement_group",
  "disagreement_group",
  "uncertainty",
  "story_cluster",
  "sector_brief",
]);
export const ProvenanceRelationshipSchema = z.enum([
  "raw_record_to_normalized_record",
  "normalized_record_to_underlying_work",
  "underlying_work_to_claim_evidence",
  "claim_evidence_to_claim",
  "claim_to_agreement_group",
  "claim_to_disagreement_group",
  "claim_to_uncertainty",
  "claim_to_story_cluster",
  "story_cluster_to_sector_brief",
]);

export const ProvenanceNodeSchema = z.object({
  nodeId: z.string().min(1),
  nodeType: ProvenanceNodeTypeSchema,
  reviewStatus: z.enum(["accepted", "review_required", "rejected", "quarantined"]),
  rulesVersion: z.string().regex(/^normalization-v\d+$/),
});
export const ProvenanceEdgeSchema = z.object({
  edgeId: z.string().min(1),
  fromNodeId: z.string().min(1),
  toNodeId: z.string().min(1),
  relationship: ProvenanceRelationshipSchema,
  independentContribution: z.boolean().optional(),
  rulesVersion: z.string().regex(/^normalization-v\d+$/),
});
export const ProvenanceGraphSchema = z.object({
  graphId: z.string().min(1),
  nodes: z.array(ProvenanceNodeSchema),
  edges: z.array(ProvenanceEdgeSchema),
  visibleClaimIds: z.array(z.string().min(1)),
  visibleSectorBriefStatementIds: z.array(z.string().min(1)),
  rulesVersion: z.string().regex(/^normalization-v\d+$/),
});

export type ProvenanceNode = z.infer<typeof ProvenanceNodeSchema>;
export type ProvenanceEdge = z.infer<typeof ProvenanceEdgeSchema>;
export type ProvenanceGraph = z.infer<typeof ProvenanceGraphSchema>;
