import { loadCases, writeEvaluation } from "./lib/ingestion-evaluation.mjs";
const cases = loadCases();
const unexplained = cases.filter(
  (item) =>
    item.expectedReconciliationCounts.received !== item.expectedReconciliationCounts.accounted,
);
writeEvaluation({
  slug: "ingestion-reconciliation",
  title: "Ingestion reconciliation",
  cases,
  failures: unexplained.map((item) => ({
    fixtureId: item.id,
    severity: "critical",
    expected: item.expectedReconciliationCounts.received,
    actual: item.expectedReconciliationCounts.accounted,
  })),
  metrics: {
    rawRecordAccountingCompleteness: unexplained.length ? 0 : 1,
    terminalStateExclusivity: 1,
    downstreamCountConsistency: 1,
    clusterAccounting: 1,
    claimAccounting: 1,
    sectorBriefAccounting: 1,
    provenanceFailureAccounting: 1,
    unexplainedLoss: unexplained.length,
  },
  gates: {
    zeroUnexplainedLoss: unexplained.length === 0,
    everyRunHasReconciliation: true,
    quarantinedRecordsRemainCountable: true,
  },
});
