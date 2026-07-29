import { semiconductorsSector } from "@cluster-mkt/config";
import {
  assembleSectorFeed,
  buildSectorBrief,
  type MarketEdition,
  type SectorFeedCandidate,
} from "@cluster-mkt/core";

const candidates: SectorFeedCandidate[] = [
  {
    id: "cluster-semiconductor-export-controls",
    title: "Fixture export controls reach equipment, manufacturing, and advanced compute",
    scope: "sector_wide",
    materialityScore: 94,
    relevanceScore: 97,
    subindustryIds: [
      "chip_design_and_compute",
      "foundries_and_manufacturing",
      "semiconductor_equipment",
    ],
    whyIncluded:
      "Included because the fixture rule covers several product categories and multiple semiconductor subindustries.",
    active: true,
    sourceCount: 4,
    themes: ["Trade policy", "Supply-chain constraints"],
    pointsOfAgreement: ["The fixture rule reaches multiple semiconductor categories."],
    competingArguments: ["Fixture analysts disagree about the pace of capacity relocation."],
    uncertainty: ["The implementation timetable remains unresolved in the fixture evidence."],
    whatWouldChangeThePicture: ["Final category guidance would clarify the breadth of the rule."],
  },
  {
    id: "cluster-memory-pricing-cycle",
    title: "Multiple fixture producers point to a changing memory pricing cycle",
    scope: "sector_wide",
    materialityScore: 88,
    relevanceScore: 91,
    subindustryIds: ["memory", "semiconductor_equipment"],
    whyIncluded:
      "Included because independent fixture evidence covers pricing and capacity across several memory producers.",
    active: true,
    sourceCount: 3,
    themes: ["Memory pricing", "Inventory cycle"],
    uncertainty: ["The duration of the fixture pricing change is not established."],
  },
  {
    id: "cluster-foundry-capex-impact",
    title: "Major foundry fixture raises capacity investment plans",
    scope: "company_led_sector_impact",
    materialityScore: 83,
    relevanceScore: 86,
    issuerId: "company-tsmc",
    subindustryIds: [
      "foundries_and_manufacturing",
      "semiconductor_equipment",
      "packaging_and_testing",
    ],
    whyIncluded:
      "Included because the company-led fixture has documented order and capacity implications for equipment and packaging suppliers.",
    active: true,
    sourceCount: 3,
    themes: ["Capacity investment", "Equipment demand"],
    whatWouldChangeThePicture: ["Supplier order fixtures would confirm the timing of propagation."],
  },
  {
    id: "cluster-fed-chip-financing",
    title: "Fixture rate path changes financing context for capacity expansion",
    scope: "macro_to_sector",
    materialityScore: 72,
    relevanceScore: 78,
    subindustryIds: ["foundries_and_manufacturing", "semiconductor_equipment"],
    whyIncluded:
      "Included because the macro fixture identifies a specific financing channel into capital-intensive semiconductor capacity.",
    active: true,
    sourceCount: 2,
    themes: ["Interest rates", "Financing conditions"],
    uncertainty: ["The fixture does not imply an equal effect on every semiconductor company."],
  },
  {
    id: "cluster-analog-inventory-company",
    title: "Fixture analog supplier reports a broader inventory normalization signal",
    scope: "company_specific",
    materialityScore: 67,
    relevanceScore: 70,
    issuerId: "company-texas-instruments",
    subindustryIds: ["analog_and_power"],
    whyIncluded:
      "Included because the company fixture documents customer inventory effects beyond the issuer and exceeds the sector threshold.",
    active: true,
    sourceCount: 2,
    themes: ["Inventory cycle"],
  },
];

export const sectorRouteByClusterId: Record<string, string> = {
  "cluster-semiconductor-export-controls": "/clusters/cluster-grid-review?tab=overview",
  "cluster-memory-pricing-cycle": "/clusters/cluster-supply-update?tab=read",
  "cluster-foundry-capex-impact": "/clusters/cluster-supply-update?tab=overview",
  "cluster-fed-chip-financing": "/clusters/cluster-grid-review?tab=read",
  "cluster-analog-inventory-company": "/clusters/cluster-supply-update?tab=listen",
};

export function createDemoSectorCoverage(edition: MarketEdition) {
  const feed = assembleSectorFeed({
    sectorId: semiconductorsSector.id,
    marketEdition: edition,
    marketDate: "2026-07-29",
    candidates,
    expectedSubindustryIds: semiconductorsSector.subindustries.map((item) => item.id),
  });
  const brief = buildSectorBrief({
    sectorName: semiconductorsSector.name,
    feed,
    generatedAt: "2026-07-29T16:00:00.000Z",
  });
  return { sector: semiconductorsSector, feed, brief };
}
