import type { AnnotationItem } from "../schemas/annotation-item";
import type { AgentReviewPacket, AgentReviewRiskClass } from "../schemas/agent-review-packet";
import type { AgentReviewerRoleId } from "../schemas/agent-reviewer-role";
import { stableFingerprint } from "./idempotency-key";

export const AGENT_REVIEW_PACKET_VERSION = "agent-packet-v1";

export interface AgentReviewPacketInput {
  item: Pick<
    AnnotationItem,
    | "corpusVersion"
    | "itemId"
    | "task"
    | "difficultyClass"
    | "evidencePackage"
    | "allowedReviewerVisibleFields"
  >;
  role: AgentReviewerRoleId;
  riskClass: AgentReviewRiskClass;
  reviewerInstructions: string;
  handbookExcerpt: string;
  allowedLabelIds: readonly string[];
  requiredResponseFields: readonly string[];
}

export function buildAgentReviewPacket(input: AgentReviewPacketInput): AgentReviewPacket {
  const packetId = `agent-packet-${stableFingerprint([
    input.item.corpusVersion,
    input.item.itemId,
    input.item.task,
    input.role,
  ]).slice(0, 12)}`;
  const draft = {
    packetId,
    packetVersion: AGENT_REVIEW_PACKET_VERSION,
    task: input.item.task,
    role: input.role,
    riskClass: input.riskClass,
    difficultyClass: input.item.difficultyClass,
    reviewerInstructions: input.reviewerInstructions,
    handbookExcerpt: input.handbookExcerpt,
    allowedLabelIds: [...input.allowedLabelIds],
    evidencePackage: { ...input.item.evidencePackage },
    allowedProvenanceFields: [...input.item.allowedReviewerVisibleFields],
    requiredResponseFields: [...input.requiredResponseFields],
  };
  const packetHash = stableFingerprint([JSON.stringify(draft)]);
  return { ...draft, packetHash };
}
