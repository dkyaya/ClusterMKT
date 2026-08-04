#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  emit,
  loadManifest,
  loadPilotSelection,
  loadResults,
  refuse,
  root,
} from "./lib/agent-review-reporting.mjs";

const results = loadResults();
const manifest = loadManifest();
const selection = loadPilotSelection();

if (!results || !manifest || !selection) {
  refuse(
    "pilot artifacts incomplete — need pilot-selection.json, packet-manifest.json, and pilot-results.json",
  );
  process.exit();
}

const mainResults = results.mainResults;
const decisionCount = mainResults.reduce((sum, r) => sum + r.decisions.length, 0);
const validDecisionCount = mainResults.reduce((sum, r) => sum + r.panel.validDecisionCount, 0);
const invalidDecisionCount = mainResults.reduce((sum, r) => sum + r.panel.invalidDecisionCount, 0);

const outcomeCounts = mainResults.reduce((acc, r) => {
  acc[r.panel.outcome] = (acc[r.panel.outcome] ?? 0) + 1;
  return acc;
}, {});

const adjudicatedCount = mainResults.filter((r) => r.adjudication).length;
const unresolvedAdjudicationOutcomes = [
  "agent_adjudicated_unresolved",
  "agent_adjudicated_insufficient_evidence",
  "agent_adjudicated_schema_issue",
  "agent_adjudicated_fixture_issue",
];
const unresolvedAdjudicationCount = mainResults.filter(
  (r) => r.adjudication && unresolvedAdjudicationOutcomes.includes(r.adjudication.outcome),
).length;
const ownerReviewRequiredCount = mainResults.filter(
  (r) => r.ownerEscalation.status !== "not_required",
).length;

const highConfidenceMinorityDissentCount = mainResults.reduce(
  (sum, r) => sum + r.dissent.filter((d) => d.isCritical).length,
  0,
);
const cannotDetermineTotal = mainResults.reduce(
  (sum, r) => sum + r.decisions.filter((d) => d.output.cannotDetermine).length,
  0,
);
const cannotDetermineRate = decisionCount ? cannotDetermineTotal / decisionCount : 0;
const confidences = mainResults.flatMap((r) => r.decisions.map((d) => d.output.confidence));
const confidenceRank = { low: 0, medium: 1, high: 2 };
const sortedConfidences = confidences.map((c) => confidenceRank[c]).sort((a, b) => a - b);
const medianPanelConfidenceRank = sortedConfidences.length
  ? sortedConfidences[Math.floor(sortedConfidences.length / 2)]
  : null;
const medianPanelConfidence =
  medianPanelConfidenceRank === null
    ? null
    : Object.keys(confidenceRank).find((k) => confidenceRank[k] === medianPanelConfidenceRank);

const evidenceOverlapRates = mainResults.map((r) => r.panel.evidenceOverlapRate ?? 0);
const evidenceOverlapRate = evidenceOverlapRates.length
  ? evidenceOverlapRates.reduce((a, b) => a + b, 0) / evidenceOverlapRates.length
  : 0;

const criticalProvenanceObjections = mainResults.filter((r) =>
  r.ownerEscalation.reasons.includes("PROVENANCE_FAILURE_ALLEGED"),
).length;
const criticalFalseAcceptanceAttempts = mainResults.filter(
  (r) =>
    r.panel.outcome === "agent_panel_disputed" && r.panel.automaticAcceptanceAgreementRate > 0.5,
).length;

const decisionsWithoutPacketHash = mainResults.flatMap((r) =>
  r.decisions.filter((d) => !d.packet?.packetHash),
);

const report = {
  pilotVersion: "agent-review-pilot-v1",
  itemCount: mainResults.length,
  reviewerDecisionCount: decisionCount,
  validSubmissionCount: validDecisionCount,
  invalidSubmissionCount: invalidDecisionCount,
  panelOutcomeCounts: outcomeCounts,
  adjudicatedCount,
  unresolvedAdjudicationCount,
  ownerReviewRequiredCount,
  highConfidenceMinorityDissentCount,
  cannotDetermineRate,
  evidenceOverlapRate,
  medianPanelConfidence,
  criticalProvenanceObjections,
  criticalFalseAcceptanceAttempts,
  averageDecisionsPerItem: mainResults.length ? decisionCount / mainResults.length : 0,
  repeatStabilityItemCount: results.repeatResults.length,
  criticalGates: {
    zeroReviewerPacketAnswerLeakage: manifest.leakageReport.leakageFound === 0,
    zeroMalformedSubmissionsAccepted: invalidDecisionCount === 0,
    everyHighRiskItemAdjudicatedOrUnresolved: mainResults
      .filter((r) => r.riskClass === "high")
      .every((r) => r.adjudication !== null || r.provisionalState === "unresolved"),
    everyItemHasTerminalPanelState: mainResults.every((r) => Boolean(r.panel.outcome)),
    everyOwnerEscalationHasReason: mainResults
      .filter((r) => r.ownerEscalation.status !== "not_required")
      .every((r) => r.ownerEscalation.reasons.length > 0),
    noDisputedPanelMarkedUnanimous: mainResults.every(
      (r) => !(r.panel.outcome === "agent_panel_disputed" && r.panel.unanimous),
    ),
    everyWorkerDecisionHasPacketHash: decisionsWithoutPacketHash.length === 0,
  },
};

const outDir = resolve(root, "relays/tmp/blind-multi-agent-calibration-pilot/validation");
mkdirSync(outDir, { recursive: true });
writeFileSync(
  resolve(outDir, "agent-review-pilot-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

emit(report);
