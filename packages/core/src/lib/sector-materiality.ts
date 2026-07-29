import type { SectorMaterialityInput, SectorMaterialityResult } from "../types/coverage";

export const SECTOR_MATERIALITY_WEIGHTS = Object.freeze({
  directSectorNaming: 8,
  affectedConstituents: 12,
  affectedSubindustries: 14,
  constituentImportance: 4,
  supplyChainPropagation: 9,
  demandPropagation: 9,
  pricingImplications: 6,
  capacityImplications: 6,
  regulatoryBreadth: 8,
  macroBreadth: 7,
  sectorSpecificity: 6,
  primarySourceEvidence: 4,
  independentSourceDiversity: 4,
  recency: 3,
  contradictoryEvidencePenalty: 8,
});

const confidenceFactor = { low: 0.72, medium: 0.86, high: 1 } as const;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const round = (value: number) => Math.round(value * 10) / 10;

export function evaluateSectorMateriality(input: SectorMaterialityInput): SectorMaterialityResult {
  const breadthConstituents = clamp(input.affectedConstituentCount / 4);
  const breadthSubindustries = clamp(input.affectedSubindustryCount / 3);
  const independentSources = clamp((input.independentSourceCount - 1) / 3);
  const values = {
    directSectorNaming: clamp(input.directSectorNaming),
    affectedConstituents: breadthConstituents,
    affectedSubindustries: breadthSubindustries,
    constituentImportance: clamp(input.constituentImportance),
    supplyChainPropagation: clamp(input.supplyChainPropagation),
    demandPropagation: clamp(input.demandPropagation),
    pricingImplications: clamp(input.pricingImplications),
    capacityImplications: clamp(input.capacityImplications),
    regulatoryBreadth: clamp(input.regulatoryBreadth),
    macroBreadth: clamp(input.macroBreadth),
    sectorSpecificity: clamp(input.sectorSpecificity),
    primarySourceEvidence: clamp(input.primarySourceEvidence),
    independentSourceDiversity: independentSources,
    recency: clamp(input.recency),
  };

  let raw = Object.entries(values).reduce(
    (total, [key, value]) => total + value * SECTOR_MATERIALITY_WEIGHTS[key as keyof typeof values],
    0,
  );
  raw -=
    clamp(input.contradictoryEvidence) * SECTOR_MATERIALITY_WEIGHTS.contradictoryEvidencePenalty;
  raw *= confidenceFactor[input.confidence];

  const explanationCodes: string[] = [];
  if (breadthConstituents >= 0.5) explanationCodes.push("MULTIPLE_CONSTITUENTS");
  if (breadthSubindustries >= 0.5) explanationCodes.push("MULTIPLE_SUBINDUSTRIES");
  if (input.regulatoryBreadth >= 0.6) explanationCodes.push("REGULATORY_BREADTH");
  if (input.macroBreadth >= 0.6 && input.sectorSpecificity >= 0.5)
    explanationCodes.push("SECTOR_SPECIFIC_MACRO_LINK");
  if (input.supplyChainPropagation >= 0.5) explanationCodes.push("SUPPLY_CHAIN_PROPAGATION");
  if (input.demandPropagation >= 0.5) explanationCodes.push("DEMAND_PROPAGATION");
  if (input.primarySourceEvidence > 0) explanationCodes.push("PRIMARY_SOURCE_SUPPORT");
  if (input.independentSourceCount >= 2) explanationCodes.push("INDEPENDENT_SOURCE_SUPPORT");
  if (input.contradictoryEvidence > 0) explanationCodes.push("CONTRADICTORY_EVIDENCE");

  const hasPropagation =
    input.supplyChainPropagation >= 0.45 ||
    input.demandPropagation >= 0.45 ||
    input.pricingImplications >= 0.55 ||
    input.capacityImplications >= 0.55 ||
    input.regulatoryBreadth >= 0.55 ||
    (input.macroBreadth >= 0.55 && input.sectorSpecificity >= 0.5);
  const hasBroadEvidence =
    input.affectedConstituentCount >= 2 ||
    input.affectedSubindustryCount >= 2 ||
    input.regulatoryBreadth >= 0.7;

  let scoreCap = 100;
  if (input.incidentalMention) {
    scoreCap = 15;
    explanationCodes.push("INCIDENTAL_MENTION_CAP");
  }
  if (input.headlineOnly) {
    scoreCap = Math.min(scoreCap, 35);
    explanationCodes.push("HEADLINE_ONLY_CAP");
  }
  if (input.podcastMetadataOnly) {
    scoreCap = Math.min(scoreCap, 25);
    explanationCodes.push("PODCAST_METADATA_EXCLUDED");
  }
  if (input.affectedConstituentCount <= 1 && !hasPropagation) {
    scoreCap = Math.min(scoreCap, 44);
    explanationCodes.push("NO_SECTOR_PROPAGATION_CAP");
  }

  const materialityScore = round(Math.min(scoreCap, Math.max(0, raw)));
  const relevanceScore = round(
    Math.min(
      scoreCap,
      Math.max(
        0,
        materialityScore * 0.75 + values.sectorSpecificity * 15 + values.directSectorNaming * 10,
      ),
    ),
  );

  let recommendedScope: SectorMaterialityResult["recommendedScope"] = "company_specific";
  if (input.macroBreadth >= 0.55 && input.sectorSpecificity >= 0.5 && hasPropagation) {
    recommendedScope = "macro_to_sector";
  } else if (!input.companyLed && hasBroadEvidence && materialityScore >= 48) {
    recommendedScope = "sector_wide";
  } else if (input.companyLed && hasPropagation && materialityScore >= 48) {
    recommendedScope = "company_led_sector_impact";
  }

  const requiredReview =
    (!input.explicitRelationship && input.independentSourceCount <= 1 && materialityScore >= 45) ||
    input.confidence === "low" ||
    input.contradictoryEvidence >= 0.6;
  if (requiredReview) explanationCodes.push("HUMAN_REVIEW_REQUIRED");

  const included =
    !input.incidentalMention &&
    !input.podcastMetadataOnly &&
    !input.headlineOnly &&
    materialityScore >= 45 &&
    (recommendedScope !== "company_specific" || (hasPropagation && materialityScore >= 60));
  if (included) explanationCodes.push("SECTOR_FEED_THRESHOLD_MET");
  else explanationCodes.push("SECTOR_FEED_THRESHOLD_NOT_MET");

  const reasonMap: Record<string, string> = {
    MULTIPLE_CONSTITUENTS: "multiple constituents are materially affected",
    MULTIPLE_SUBINDUSTRIES: "the evidence spans multiple subindustries",
    REGULATORY_BREADTH: "a sector-level policy action has broad reach",
    SECTOR_SPECIFIC_MACRO_LINK: "the macro development has a specific sector transmission path",
    SUPPLY_CHAIN_PROPAGATION: "the event propagates through the supply chain",
    DEMAND_PROPAGATION: "the evidence shows demand effects beyond one issuer",
    PRIMARY_SOURCE_SUPPORT: "primary-source evidence supports the relationship",
    INDEPENDENT_SOURCE_SUPPORT: "independent sources corroborate the relationship",
  };
  const reasons = explanationCodes.filter((code) => reasonMap[code]).map((code) => reasonMap[code]);
  const whyIncluded = included
    ? `Included because ${reasons.slice(0, 3).join(", ") || "documented sector propagation crosses the threshold"}.`
    : "Excluded because the available evidence does not establish material sector propagation.";

  return {
    materialityScore,
    relevanceScore,
    recommendedScope,
    included,
    explanationCodes,
    whyIncluded,
    requiredReview,
  };
}
