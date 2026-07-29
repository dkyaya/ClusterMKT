import type { SectorFeedCandidate, SectorFeedItem } from "../types/coverage";

const scopePriority = {
  sector_wide: 4,
  company_led_sector_impact: 3,
  macro_to_sector: 2,
  company_specific: 1,
} as const;

export interface DiversityRankingResult {
  items: SectorFeedItem[];
  adjustments: string[];
}

export function rankWithCoverageDiversity(
  candidates: SectorFeedCandidate[],
): DiversityRankingResult {
  const original = [...candidates].sort(
    (a, b) =>
      scopePriority[b.scope] - scopePriority[a.scope] ||
      b.materialityScore - a.materialityScore ||
      b.relevanceScore - a.relevanceScore ||
      a.id.localeCompare(b.id),
  );
  const issuerCandidates = original.filter(
    (item) =>
      item.issuerId && ["company_led_sector_impact", "company_specific"].includes(item.scope),
  );
  const qualifyingIssuers = new Set(issuerCandidates.map((item) => item.issuerId));
  const enforce = qualifyingIssuers.size >= 3;
  const selected: SectorFeedCandidate[] = [];
  const remaining = [...original];
  const issuerCounts = new Map<string, number>();
  const representedSubindustries = new Set<string>();
  const adjustments: string[] = [];
  let deferredFromFirstTen = false;

  while (remaining.length > 0) {
    const slot = selected.length;
    let candidateIndex = 0;
    if (enforce && slot < 10) {
      const allowed = remaining
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => {
          if (
            !item.issuerId ||
            !["company_led_sector_impact", "company_specific"].includes(item.scope)
          )
            return true;
          return (issuerCounts.get(item.issuerId) ?? 0) < 2;
        });
      if (allowed.length > 0) {
        const topScore = allowed[0]?.item.materialityScore ?? 0;
        const breadthAlternative = allowed.find(
          ({ item }) =>
            topScore - item.materialityScore <= 5 &&
            item.subindustryIds.some((id) => !representedSubindustries.has(id)),
        );
        candidateIndex = (breadthAlternative ?? allowed[0])?.index ?? 0;
      } else {
        deferredFromFirstTen = true;
        adjustments.push(
          "Deferred additional same-issuer items beyond the first-ten placement window.",
        );
        break;
      }
    }
    const [candidate] = remaining.splice(candidateIndex, 1);
    if (!candidate) break;
    if (candidateIndex > 0) {
      adjustments.push(
        `Moved ${candidate.id} ahead at position ${slot + 1} to preserve issuer or subindustry diversity.`,
      );
    }
    selected.push(candidate);
    if (candidate.issuerId) {
      issuerCounts.set(candidate.issuerId, (issuerCounts.get(candidate.issuerId) ?? 0) + 1);
    }
    candidate.subindustryIds.forEach((id) => representedSubindustries.add(id));
  }

  selected.push(...remaining);
  const originalRank = new Map(original.map((item, index) => [item.id, index + 1]));
  const firstDeferredIndex = deferredFromFirstTen ? selected.length - remaining.length : -1;
  return {
    items: selected.map((item, index) => {
      const adjustedRank =
        deferredFromFirstTen && index >= firstDeferredIndex
          ? 11 + index - firstDeferredIndex
          : index + 1;
      return {
        ...item,
        originalRank: originalRank.get(item.id) ?? index + 1,
        adjustedRank,
        diversityAdjusted: (originalRank.get(item.id) ?? index + 1) !== adjustedRank,
      };
    }),
    adjustments,
  };
}
