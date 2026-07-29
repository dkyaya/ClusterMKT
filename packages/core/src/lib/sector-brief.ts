import { SectorBriefSchema, type SectorBrief } from "../schemas/sector-brief";
import type { SectorFeed } from "../types/coverage";

export function buildSectorBrief(input: {
  sectorName: string;
  feed: SectorFeed;
  generatedAt: string;
  demonstrationData?: boolean;
}): SectorBrief {
  const active = input.feed.items.filter((item) => item.active);
  const byScope = (scope: SectorFeed["items"][number]["scope"]) =>
    active.filter((item) => item.scope === scope).map((item) => item.id);
  const issuers = new Set(active.flatMap((item) => (item.issuerId ? [item.issuerId] : [])));
  const subindustries = [...new Set(active.flatMap((item) => item.subindustryIds))];
  const themes = [...new Set(active.flatMap((item) => item.themes))].slice(0, 5);
  const dominantIssuer = [...issuers].find(
    (issuer) => active.filter((item) => item.issuerId === issuer).length > active.length / 2,
  );
  const uncertainty = [...new Set(active.flatMap((item) => item.uncertainty ?? []))];
  if (dominantIssuer)
    uncertainty.push(`Available evidence is concentrated around ${dominantIssuer}.`);

  return SectorBriefSchema.parse({
    id: `sector-brief-${input.feed.sectorId.replaceAll("_", "-")}-${input.feed.marketDate}-${input.feed.marketEdition}`,
    sectorId: input.feed.sectorId,
    sectorName: input.sectorName,
    marketEdition: input.feed.marketEdition,
    marketDate: input.feed.marketDate,
    generatedAt: input.generatedAt,
    activeClusterIds: active.map((item) => item.id),
    sectorWideClusterIds: byScope("sector_wide"),
    companyLedImpactClusterIds: byScope("company_led_sector_impact"),
    macroToSectorClusterIds: byScope("macro_to_sector"),
    keyThemes: themes,
    mostAffectedSubindustries: subindustries.slice(0, 5),
    pointsOfAgreement: [...new Set(active.flatMap((item) => item.pointsOfAgreement ?? []))],
    competingArguments: [...new Set(active.flatMap((item) => item.competingArguments ?? []))],
    uncertainty,
    coverageGaps: input.feed.coverageGaps,
    whatWouldChangeThePicture: [
      ...new Set(active.flatMap((item) => item.whatWouldChangeThePicture ?? [])),
    ],
    breadthMetrics: {
      materialDevelopmentCount: active.length,
      issuerCount: issuers.size,
      subindustryCount: subindustries.length,
      sectorWideCount: byScope("sector_wide").length,
      companyLedCount: byScope("company_led_sector_impact").length,
      macroToSectorCount: byScope("macro_to_sector").length,
    },
    demonstrationData: input.demonstrationData ?? true,
  });
}
