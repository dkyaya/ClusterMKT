import type { AgentReviewDecision } from "../schemas/agent-review-decision";

export interface AnonymizedPanelDecision extends Omit<
  AgentReviewDecision,
  "reviewerId" | "packetHash"
> {
  anonymizedMemberId: string;
}

export interface AgentWorkerOutputRecord<T> {
  workerId: string;
  writtenAt: string;
  payload: T;
}

export interface PacketLeakageCheck {
  packetId: string;
  forbiddenFieldsFound: string[];
  passed: boolean;
}
