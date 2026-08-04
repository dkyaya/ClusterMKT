import type { AgentPanelResult } from "../schemas/agent-panel-result";
import type { AgentReviewDecision } from "../schemas/agent-review-decision";
import type { AgentDissent } from "../schemas/agent-dissent";

export function summarizeAgentPanelAgreement(panels: readonly AgentPanelResult[]) {
  const outcomeCounts = panels.reduce<Record<string, number>>((accumulator, panel) => {
    accumulator[panel.outcome] = (accumulator[panel.outcome] ?? 0) + 1;
    return accumulator;
  }, {});
  const shares = panels
    .map((panel) => panel.majorityShare)
    .filter((value): value is number => value !== null);
  return {
    panelCount: panels.length,
    outcomeCounts,
    averageMajorityShare: shares.length ? shares.reduce((a, b) => a + b, 0) / shares.length : null,
    averageCannotDetermineRate: panels.length
      ? panels.reduce((sum, panel) => sum + panel.cannotDetermineRate, 0) / panels.length
      : 0,
    averageEvidenceOverlapRate: panels.length
      ? panels.reduce((sum, panel) => sum + panel.evidenceOverlapRate, 0) / panels.length
      : 0,
    averageHumanReviewRecommendationRate: panels.length
      ? panels.reduce((sum, panel) => sum + panel.humanReviewRecommendationRate, 0) / panels.length
      : 0,
  };
}

export function roleDissentRates(
  decisions: readonly AgentReviewDecision[],
  dissent: readonly AgentDissent[],
): Record<string, number> {
  const byRole = new Map<string, { total: number; dissenting: number }>();
  for (const decision of decisions) {
    const entry = byRole.get(decision.role) ?? { total: 0, dissenting: 0 };
    entry.total += 1;
    byRole.set(decision.role, entry);
  }
  for (const entry of dissent) {
    const counters = byRole.get(entry.role) ?? { total: 0, dissenting: 0 };
    counters.dissenting += 1;
    byRole.set(entry.role, counters);
  }
  return Object.fromEntries(
    [...byRole.entries()].map(([role, { total, dissenting }]) => [
      role,
      total ? dissenting / total : 0,
    ]),
  );
}

export function highConfidenceMinorityDissentCount(dissent: readonly AgentDissent[]): number {
  return dissent.filter((entry) => entry.isCritical).length;
}
