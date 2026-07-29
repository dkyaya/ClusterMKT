import type { MarketEdition } from "../schemas/edition";
import type { SectorFeed, SectorFeedCandidate } from "../types/coverage";
import { rankWithCoverageDiversity } from "./coverage-diversity";

export function assembleSectorFeed(input: {
  sectorId: string;
  marketEdition: MarketEdition;
  marketDate: string;
  candidates: SectorFeedCandidate[];
  expectedSubindustryIds: string[];
}): SectorFeed {
  const accepted = input.candidates.filter(
    (candidate) => candidate.active && candidate.whyIncluded.trim().length > 0,
  );
  const ranked = rankWithCoverageDiversity(accepted);
  const covered = new Set(ranked.items.flatMap((item) => item.subindustryIds));
  const coverageGaps = input.expectedSubindustryIds
    .filter((id) => !covered.has(id))
    .map((id) => `No qualifying active evidence for ${id.replaceAll("_", " ")}.`);
  return {
    sectorId: input.sectorId,
    marketEdition: input.marketEdition,
    marketDate: input.marketDate,
    items: ranked.items,
    diversityAdjustments: ranked.adjustments,
    coverageGaps,
  };
}
