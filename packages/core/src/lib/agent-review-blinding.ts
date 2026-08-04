import type { AnnotationItem } from "../schemas/annotation-item";
import type { AgentReviewPacket, AgentReviewRiskClass } from "../schemas/agent-review-packet";
import type { AgentReviewerRoleId } from "../schemas/agent-reviewer-role";
import { buildAgentReviewPacket } from "./agent-review-packet";
import { redactItemForAgentPacket } from "./agent-review-redaction";

export interface BlindAgentPacketInput {
  item: AnnotationItem;
  role: AgentReviewerRoleId;
  riskClass: AgentReviewRiskClass;
  reviewerInstructions: string;
  handbookExcerpt: string;
  allowedLabelIds: readonly string[];
  requiredResponseFields: readonly string[];
}

export function blindItemIntoAgentPacket(input: BlindAgentPacketInput): AgentReviewPacket {
  const redacted = redactItemForAgentPacket(input.item);
  return buildAgentReviewPacket({
    item: {
      corpusVersion: input.item.corpusVersion,
      itemId: input.item.itemId,
      task: input.item.task,
      difficultyClass: input.item.difficultyClass,
      allowedReviewerVisibleFields: input.item.allowedReviewerVisibleFields,
      evidencePackage: {
        headline: redacted.headline,
        abstract: redacted.abstract,
        structuredFields: redacted.structuredFields,
        permittedExcerpt: redacted.permittedExcerpt,
      },
    },
    role: input.role,
    riskClass: input.riskClass,
    reviewerInstructions: input.reviewerInstructions,
    handbookExcerpt: input.handbookExcerpt,
    allowedLabelIds: input.allowedLabelIds,
    requiredResponseFields: input.requiredResponseFields,
  });
}
