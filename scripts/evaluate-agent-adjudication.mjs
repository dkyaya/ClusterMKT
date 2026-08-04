#!/usr/bin/env node
import { emit, loadResults, refuse } from "./lib/agent-review-reporting.mjs";

const results = loadResults();
if (!results) {
  refuse(
    "no pilot results found at .tmp/agent-review-pilot/results/pilot-results.json — run the pilot first",
  );
  process.exit();
}

const adjudicated = results.mainResults.filter((r) => r.adjudication);
const outcomeCounts = adjudicated.reduce((acc, r) => {
  acc[r.adjudication.outcome] = (acc[r.adjudication.outcome] ?? 0) + 1;
  return acc;
}, {});
const unresolvedOutcomes = [
  "agent_adjudicated_unresolved",
  "agent_adjudicated_insufficient_evidence",
  "agent_adjudicated_schema_issue",
  "agent_adjudicated_fixture_issue",
];
const unresolvedCount = adjudicated.filter((r) =>
  unresolvedOutcomes.includes(r.adjudication.outcome),
).length;

const highRiskItems = results.mainResults.filter((r) => r.riskClass === "high");
const highRiskAdjudicatedOrUnresolved = highRiskItems.filter(
  (r) => r.adjudication !== null || r.provisionalState === "unresolved",
).length;

const anonymizedReferenceViolations = adjudicated.filter((r) => {
  const accepted = r.adjudication.decisionsAcceptedMemberIds ?? [];
  const rejected = r.adjudication.decisionsRejectedMemberIds ?? [];
  return [...accepted, ...rejected].some((id) => !/^panel-member-\d+$/.test(id));
});

const missingEvidenceForResolved = adjudicated.filter(
  (r) =>
    !unresolvedOutcomes.includes(r.adjudication.outcome) &&
    (!r.adjudication.evidenceRelied || r.adjudication.evidenceRelied.length === 0),
);

const attemptFailures = results.mainResults.filter((r) =>
  r.ownerEscalation.reasons.includes("ADJUDICATION_ATTEMPT_FAILED"),
).length;

emit({
  status: "measured_from_pilot_results",
  adjudicatedCount: adjudicated.length,
  outcomeCounts,
  unresolvedCount,
  highRiskItemCount: highRiskItems.length,
  highRiskAdjudicatedOrUnresolved,
  highRiskGatePassed: highRiskAdjudicatedOrUnresolved === highRiskItems.length,
  anonymizedReferenceViolationCount: anonymizedReferenceViolations.length,
  missingEvidenceForResolvedCount: missingEvidenceForResolved.length,
  adjudicationAttemptFailures: attemptFailures,
  warning:
    "Every adjudication references anonymized panel-member ids only; reviewer identity is never exposed to the adjudicator.",
});
