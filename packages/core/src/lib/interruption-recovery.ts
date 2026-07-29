import type { IngestionCheckpoint } from "../schemas/ingestion-checkpoint";

export function recoverFromInterruption<T extends { id: string }>(input: {
  checkpoint: IngestionCheckpoint;
  completedOutputs: readonly T[];
  proposedOutputs: readonly T[];
}): T[] {
  const byId = new Map(input.completedOutputs.map((item) => [item.id, item]));
  for (const item of input.proposedOutputs) if (!byId.has(item.id)) byId.set(item.id, item);
  return [...byId.values()];
}
