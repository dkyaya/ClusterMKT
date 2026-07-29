export interface DeterministicClock {
  now(): string;
}

export interface IngestionRulesVersions {
  registry: string;
  normalization: string;
  ingestion: string;
}

export type QueueKind = "retry" | "review" | "quarantine" | "dead_letter";
