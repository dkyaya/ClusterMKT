import type { IngestionCheckpoint } from "../schemas/ingestion-checkpoint";
import type { ResumeToken } from "../schemas/resume-token";
import { stableFingerprint } from "./idempotency-key";

export function createResumeToken(
  checkpoint: IngestionCheckpoint,
  createdAt: string,
  rulesVersion: string,
): ResumeToken {
  return {
    token: stableFingerprint([
      checkpoint.runId,
      checkpoint.checkpointId,
      checkpoint.checksum,
      rulesVersion,
    ]),
    runId: checkpoint.runId,
    checkpointId: checkpoint.checkpointId,
    lastSafeStage: checkpoint.stage,
    createdAt,
    rulesVersion,
  };
}

export function validateResumeToken(token: ResumeToken, checkpoint: IngestionCheckpoint): boolean {
  return (
    token.runId === checkpoint.runId &&
    token.checkpointId === checkpoint.checkpointId &&
    token.token ===
      stableFingerprint([
        checkpoint.runId,
        checkpoint.checkpointId,
        checkpoint.checksum,
        token.rulesVersion,
      ])
  );
}
