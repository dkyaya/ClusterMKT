import type {
  IngestionReconciliation,
  IngestionTerminalState,
} from "../schemas/ingestion-reconciliation";

export function reconcileIngestion(input: {
  runId: string;
  rawRecordIds: readonly string[];
  states: Readonly<Record<string, readonly IngestionTerminalState[]>>;
  counts?: Readonly<Record<string, number>>;
  provenanceFailureIds?: readonly string[];
}): IngestionReconciliation {
  const unexplained = input.rawRecordIds.filter((id) => !input.states[id]?.length);
  const multiply = input.rawRecordIds.filter((id) => (input.states[id]?.length ?? 0) !== 1);
  const rawRecordStates: Record<string, IngestionTerminalState> = {};
  for (const id of input.rawRecordIds) {
    const state = input.states[id]?.[0];
    if (state) rawRecordStates[id] = state;
  }
  const provenanceFailureIds = [...(input.provenanceFailureIds ?? [])];
  return {
    runId: input.runId,
    counts: { rawRecordsReceived: input.rawRecordIds.length, ...input.counts },
    rawRecordStates,
    unexplainedRawRecordIds: unexplained,
    multiplyAccountedRawRecordIds: multiply,
    provenanceFailureIds,
    reconciled:
      unexplained.length === 0 && multiply.length === 0 && provenanceFailureIds.length === 0,
    explanationCodes: [
      unexplained.length === 0 ? "ALL_RAW_RECORDS_ACCOUNTED" : "UNEXPLAINED_RAW_RECORD_LOSS",
      multiply.length === 0 ? "TERMINAL_STATE_EXCLUSIVE" : "MULTIPLE_TERMINAL_STATES",
    ],
  };
}
