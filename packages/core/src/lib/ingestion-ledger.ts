import type { IngestionLedgerEntry } from "../schemas/ingestion-ledger-entry";

export class InMemoryIngestionLedger {
  readonly entries: IngestionLedgerEntry[] = [];
  private readonly seen = new Set<string>();

  record(entry: IngestionLedgerEntry): boolean {
    if (this.seen.has(entry.ledgerEntryId)) return false;
    this.seen.add(entry.ledgerEntryId);
    this.entries.push(entry);
    return true;
  }

  entriesForRun(runId: string): IngestionLedgerEntry[] {
    return this.entries.filter((entry) => entry.runId === runId);
  }
}
