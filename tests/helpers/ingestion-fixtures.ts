import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface IngestionFixtureCase {
  caseNumber: number;
  id: string;
  inputSourceRegistryState: string;
  adapterState: string;
  expectedRetrievalAttempts: number;
  expectedRetries: number;
  expectedRawRecords: number;
  expectedIdempotencyDecisions: string[];
  expectedQuarantineOrReviewState: string;
  expectedNormalizedRecords: number;
  expectedStoryClusters: number;
  expectedSectorBriefs: number;
  expectedReconciliationCounts: { received: number; accounted: number };
  expectedLedgerState: string;
  expectedResumeState: string;
  expectedExplanationCodes: string[];
}

const fixtureFiles = [
  "sources/source-cases.json",
  "failures/failure-cases.json",
  "resume/resume-cases.json",
  "runs/run-cases.json",
  "quarantine/quarantine-cases.json",
];

export function loadIngestionFixtures(): IngestionFixtureCase[] {
  return fixtureFiles
    .flatMap(
      (file) =>
        JSON.parse(
          readFileSync(resolve(process.cwd(), "tests/fixtures/ingestion", file), "utf8"),
        ) as IngestionFixtureCase[],
    )
    .sort((left, right) => left.caseNumber - right.caseNumber);
}
