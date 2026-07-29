import { z } from "zod";

export const IngestionReviewItemSchema = z.object({
  reviewItemId: z.string().min(1),
  runId: z.string().min(1),
  recordId: z.string().min(1).nullable(),
  reason: z.enum([
    "ambiguous_source_identity",
    "unresolved_terms_status",
    "conflicting_canonical_url",
    "idempotency_collision",
    "unclear_article_version",
    "unresolved_entity_ambiguity",
    "ambiguous_event_boundary",
    "claim_provenance_problem",
    "source_capability_mismatch",
  ]),
  provenanceIds: z.array(z.string().min(1)).min(1),
  recommendedNextAction: z.string().min(1),
  status: z.enum(["pending", "resolved", "rejected"]),
});

export type IngestionReviewItem = z.infer<typeof IngestionReviewItemSchema>;
