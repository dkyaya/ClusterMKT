import { z } from "zod";
import { ReviewerConfidenceSchema } from "./annotation-label";

export const AgentDissentSchema = z.object({
  dissentId: z.string().regex(/^agent-dissent-[a-f0-9]{12}$/),
  panelId: z.string().regex(/^agent-panel-[a-f0-9]{12}$/),
  anonymizedMemberId: z.string().regex(/^panel-member-\d+$/),
  role: z.string().min(1),
  dissentingLabelId: z.string().min(1).nullable(),
  majorityLabelId: z.string().min(1).nullable(),
  confidence: ReviewerConfidenceSchema,
  isCritical: z.boolean(),
  criticalReasonCodes: z.array(z.string().min(1)),
  detectedAt: z.iso.datetime(),
});

export type AgentDissent = z.infer<typeof AgentDissentSchema>;
