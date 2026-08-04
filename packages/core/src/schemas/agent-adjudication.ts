import { z } from "zod";
import { ReviewerConfidenceSchema } from "./annotation-label";

export const AgentAdjudicationOutcomeSchema = z.enum([
  "agent_adjudicated",
  "agent_adjudicated_review_required",
  "agent_adjudicated_insufficient_evidence",
  "agent_adjudicated_schema_issue",
  "agent_adjudicated_fixture_issue",
  "agent_adjudicated_unresolved",
]);

export const AgentAdjudicationSchema = z.object({
  adjudicationId: z.string().regex(/^agent-adjudication-[a-f0-9]{12}$/),
  panelId: z.string().regex(/^agent-panel-[a-f0-9]{12}$/),
  packetId: z.string().regex(/^agent-packet-[a-f0-9]{12}$/),
  packetHash: z.string().regex(/^[a-f0-9]{64}$/),
  adjudicatorId: z.literal("adjudicator-isolated"),
  selectedLabelId: z.string().min(1).nullable(),
  evidenceRelied: z.array(z.string().min(1)),
  decisionsAccepted: z.array(z.string().regex(/^panel-member-\d+$/)),
  decisionsRejected: z.array(z.string().regex(/^panel-member-\d+$/)),
  dissentAcceptedReason: z.string().nullable(),
  dissentRejectedReason: z.string().nullable(),
  confidence: ReviewerConfidenceSchema,
  humanReviewRecommended: z.boolean(),
  guidelineChangeRecommended: z.boolean(),
  schemaChangeRecommended: z.boolean(),
  regressionFixtureRecommended: z.boolean(),
  adjudicatorPromptVersion: z.string().regex(/^agent-adjudicator-prompt-v\d+$/),
  outcome: AgentAdjudicationOutcomeSchema,
  adjudicatedAt: z.iso.datetime(),
});

export type AgentAdjudicationOutcome = z.infer<typeof AgentAdjudicationOutcomeSchema>;
export type AgentAdjudication = z.infer<typeof AgentAdjudicationSchema>;
