#!/usr/bin/env node
import { emit, loadResults, refuse } from "./lib/agent-review-reporting.mjs";

const results = loadResults();
if (!results) {
  refuse(
    "no pilot results found at .tmp/agent-review-pilot/results/pilot-results.json — run the pilot first",
  );
  process.exit();
}

const statusCounts = results.mainResults.reduce((acc, r) => {
  acc[r.ownerEscalation.status] = (acc[r.ownerEscalation.status] ?? 0) + 1;
  return acc;
}, {});

const escalated = results.mainResults.filter((r) => r.ownerEscalation.status !== "not_required");
const missingReasons = escalated.filter((r) => r.ownerEscalation.reasons.length === 0);
const bareMajorityHighRiskPromotions = results.mainResults.filter(
  (r) => r.riskClass === "high" && r.panel.outcome === "agent_panel_majority" && !r.adjudication,
);

emit({
  status: "measured_from_pilot_results",
  itemCount: results.mainResults.length,
  statusCounts,
  escalatedCount: escalated.length,
  everyEscalationHasReason: missingReasons.length === 0,
  missingReasonCount: missingReasons.length,
  bareMajorityHighRiskPromotionCount: bareMajorityHighRiskPromotions.length,
  queue: escalated.map((r) => ({
    itemId: r.itemId,
    task: r.task,
    riskClass: r.riskClass,
    status: r.ownerEscalation.status,
    reasons: r.ownerEscalation.reasons,
  })),
});
