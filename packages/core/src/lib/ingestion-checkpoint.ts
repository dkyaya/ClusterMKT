import type { IngestionCheckpoint } from "../schemas/ingestion-checkpoint";
import { stableFingerprint } from "./idempotency-key";

export function createCheckpoint(
  input: Omit<IngestionCheckpoint, "checksum">,
): IngestionCheckpoint {
  return {
    ...input,
    checksum: stableFingerprint([
      input.checkpointId,
      input.runId,
      input.stage,
      ...input.completedSourceIds,
      ...input.completedRecordIds,
    ]),
  };
}
