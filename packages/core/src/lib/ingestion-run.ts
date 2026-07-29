import type { IngestionRun } from "../schemas/ingestion-run";
import { buildIdempotencyKey } from "./idempotency-key";

export function createIngestionRun(input: Omit<IngestionRun, "runId">): IngestionRun {
  return {
    ...input,
    runId: `run-${buildIdempotencyKey("run", [input.marketDate, input.edition, input.scheduledSlotId, input.fixtureVersion]).slice(0, 16)}`,
  };
}
