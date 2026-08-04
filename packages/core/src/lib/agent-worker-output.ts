import type { AgentReviewDecision } from "../schemas/agent-review-decision";
import type { AgentWorkerOutputRecord } from "../types/agent-review";
import { workerOutputPath } from "./agent-worker-isolation";

export function recordWorkerOutput(
  workerId: string,
  decision: AgentReviewDecision,
  writtenAt: string,
): AgentWorkerOutputRecord<AgentReviewDecision> {
  return { workerId, writtenAt, payload: decision };
}

export function workerOutputFilePath(workerId: string, packetId: string): string {
  return `${workerOutputPath(workerId)}${packetId}.json`;
}

export function detectDuplicateWorkerOutput(
  existing: readonly { workerId: string; packetId: string }[],
  candidate: { workerId: string; packetId: string },
): boolean {
  return existing.some(
    (record) => record.workerId === candidate.workerId && record.packetId === candidate.packetId,
  );
}
