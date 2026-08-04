import type { AgentReviewPacket } from "../schemas/agent-review-packet";
import type { PacketLeakageCheck } from "../types/agent-review";
import { FORBIDDEN_AGENT_PACKET_MARKERS } from "./agent-review-redaction";

export function validateAgentReviewPacketLeakage(packet: AgentReviewPacket): PacketLeakageCheck {
  const serialized = JSON.stringify(packet);
  const forbiddenFieldsFound = FORBIDDEN_AGENT_PACKET_MARKERS.filter((marker) =>
    serialized.includes(marker),
  );
  return {
    packetId: packet.packetId,
    forbiddenFieldsFound: [...forbiddenFieldsFound],
    passed: forbiddenFieldsFound.length === 0,
  };
}

const REQUIRED_DECISION_FIELDS = [
  "packetId",
  "packetHash",
  "role",
  "reviewerId",
  "confidence",
  "cannotDetermine",
  "submittedAt",
] as const;

export interface DecisionShapeValidation {
  passed: boolean;
  missingFields: string[];
  malformed: boolean;
}

export function validateAgentReviewDecisionShape(candidate: unknown): DecisionShapeValidation {
  if (typeof candidate !== "object" || candidate === null) {
    return { passed: false, missingFields: [...REQUIRED_DECISION_FIELDS], malformed: true };
  }
  const record = candidate as Record<string, unknown>;
  const missingFields = REQUIRED_DECISION_FIELDS.filter((field) => !(field in record));
  const hasLabelOrAbstention =
    typeof record.selectedLabelId === "string" ||
    record.cannotDetermine === true ||
    record.insufficientEvidence === true;
  return {
    passed: missingFields.length === 0 && hasLabelOrAbstention,
    missingFields,
    malformed: missingFields.length > 0,
  };
}
