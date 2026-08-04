#!/usr/bin/env node
import { emit, loadResults, refuse } from "./lib/agent-review-reporting.mjs";

const results = loadResults();
if (!results) {
  refuse(
    "no pilot results found at .tmp/agent-review-pilot/results/pilot-results.json — run the pilot first",
  );
  process.exit();
}

const panels = results.mainResults.map((r) => r.panel);
const outcomeCounts = panels.reduce((acc, panel) => {
  acc[panel.outcome] = (acc[panel.outcome] ?? 0) + 1;
  return acc;
}, {});
const shares = panels.map((p) => p.majorityShare).filter((v) => v !== null);
const averageMajorityShare = shares.length
  ? shares.reduce((a, b) => a + b, 0) / shares.length
  : null;
const averageCannotDetermineRate = panels.length
  ? panels.reduce((sum, p) => sum + p.cannotDetermineRate, 0) / panels.length
  : 0;
const averageEvidenceOverlapRate = panels.length
  ? panels.reduce((sum, p) => sum + (p.evidenceOverlapRate ?? 0), 0) / panels.length
  : 0;
const averageHumanReviewRecommendationRate = panels.length
  ? panels.reduce((sum, p) => sum + p.humanReviewRecommendationRate, 0) / panels.length
  : 0;

const roleDissent = new Map();
for (const item of results.mainResults) {
  for (const decision of item.decisions) {
    const entry = roleDissent.get(decision.role) ?? { total: 0, dissenting: 0 };
    entry.total += 1;
    roleDissent.set(decision.role, entry);
  }
  for (const dissent of item.dissent) {
    const entry = roleDissent.get(dissent.role) ?? { total: 0, dissenting: 0 };
    entry.dissenting += 1;
    roleDissent.set(dissent.role, entry);
  }
}
const roleDissentRates = Object.fromEntries(
  [...roleDissent.entries()].map(([role, { total, dissenting }]) => [
    role,
    total ? dissenting / total : 0,
  ]),
);

const highConfidenceMinorityDissentCount = results.mainResults.reduce(
  (sum, item) => sum + item.dissent.filter((d) => d.isCritical).length,
  0,
);

emit({
  status: "measured_from_pilot_results",
  panelCount: panels.length,
  outcomeCounts,
  averageMajorityShare,
  averageCannotDetermineRate,
  averageEvidenceOverlapRate,
  averageHumanReviewRecommendationRate,
  roleDissentRates,
  highConfidenceMinorityDissentCount,
  warning:
    "Multi-agent panel agreement is a reliability signal, not human inter-rater agreement, and is not claimed as such.",
});
