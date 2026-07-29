import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ClusterEntityRelationSchema,
  EntitySchema,
  SourceRegistryEntrySchema,
  assembleSectorFeed,
  buildSectorBrief,
  evaluateSectorMateriality,
  rankWithCoverageDiversity,
  type SectorFeedCandidate,
  type SectorMaterialityInput,
} from "../../packages/core/src/index";
import {
  demoSourceRegistry,
  governmentInstitutionFixtures,
  macroTopics,
  semiconductorEntityFixtures,
  semiconductorsSector,
} from "../../packages/config/src/index";
import { describe, expect, it } from "vitest";

interface FixtureCase {
  id: string;
  expectedScope: ReturnType<typeof evaluateSectorMateriality>["recommendedScope"];
  expectedIncluded: boolean;
  expectedReviewRequired?: boolean;
  tickerCollision?: boolean;
  podcastWithoutTranscript?: boolean;
  input: Partial<SectorMaterialityInput>;
}

const fixturePath = resolve(
  process.cwd(),
  "tests/fixtures/source-intelligence/sector-coverage-cases.json",
);
const fixtureCases = JSON.parse(readFileSync(fixturePath, "utf8")) as FixtureCase[];

const defaults: SectorMaterialityInput = {
  clusterId: "cluster-fixture",
  subindustryIds: ["chip_design_and_compute"],
  supportingSourceIds: ["source-a", "source-b"],
  directSectorNaming: 0.8,
  affectedConstituentCount: 1,
  affectedSubindustryCount: 1,
  constituentImportance: 0.8,
  supplyChainPropagation: 0,
  demandPropagation: 0,
  pricingImplications: 0,
  capacityImplications: 0,
  regulatoryBreadth: 0,
  macroBreadth: 0,
  sectorSpecificity: 0.8,
  primarySourceEvidence: 0.8,
  independentSourceCount: 2,
  recency: 1,
  explicitRelationship: true,
  confidence: "high",
  contradictoryEvidence: 0,
  active: true,
};

describe("35-case adversarial sector-coverage corpus", () => {
  it.each(fixtureCases)("classifies $id", (fixture) => {
    const result = evaluateSectorMateriality({
      ...defaults,
      ...fixture.input,
      clusterId: `cluster-${fixture.id}`,
    });
    expect(result.recommendedScope).toBe(fixture.expectedScope);
    expect(result.included).toBe(fixture.expectedIncluded);
    if (fixture.expectedReviewRequired !== undefined) {
      expect(result.requiredReview).toBe(fixture.expectedReviewRequired);
    }
    if (result.included) {
      expect(result.whyIncluded).toMatch(/^Included because/);
      expect(defaults.supportingSourceIds.length).toBeGreaterThan(0);
    }
  });

  it("has exactly the requested 35 machine-testable fixtures", () => {
    expect(fixtureCases).toHaveLength(35);
  });

  it("produces zero ticker-collision false positives", () => {
    const collisions = fixtureCases.filter((fixture) => fixture.tickerCollision);
    expect(collisions).toHaveLength(6);
    for (const fixture of collisions) {
      expect(evaluateSectorMateriality({ ...defaults, ...fixture.input }).included).toBe(false);
    }
  });

  it("never uses transcript-free podcast metadata as factual evidence", () => {
    const podcasts = fixtureCases.filter((fixture) => fixture.podcastWithoutTranscript);
    expect(podcasts).toHaveLength(1);
    expect(evaluateSectorMateriality({ ...defaults, ...podcasts[0]!.input }).included).toBe(false);
  });
});

function candidate(
  id: string,
  issuerId: string,
  score: number,
  subindustryId: string,
): SectorFeedCandidate {
  return {
    id: `cluster-${id}`,
    title: id,
    scope: "company_led_sector_impact",
    materialityScore: score,
    relevanceScore: score,
    issuerId,
    subindustryIds: [subindustryId],
    whyIncluded: `Included because ${id} propagates beyond one issuer.`,
    active: true,
    sourceCount: 2,
    themes: ["fixture-theme"],
  };
}

describe("sector feed diversity", () => {
  const manyIssuerCandidates = [
    candidate("nvidia-1", "company-nvidia", 99, "chip_design_and_compute"),
    candidate("nvidia-2", "company-nvidia", 98, "chip_design_and_compute"),
    candidate("nvidia-3", "company-nvidia", 97, "chip_design_and_compute"),
    candidate("nvidia-4", "company-nvidia", 96, "chip_design_and_compute"),
    candidate("tsmc-1", "company-tsmc", 94, "foundries_and_manufacturing"),
    candidate("tsmc-2", "company-tsmc", 90, "foundries_and_manufacturing"),
    candidate("micron-1", "company-micron", 92, "memory"),
    candidate("micron-2", "company-micron", 88, "memory"),
    candidate("asml-1", "company-asml", 89, "semiconductor_equipment"),
    candidate("asml-2", "company-asml", 87, "semiconductor_equipment"),
  ];

  it("limits one issuer to two company positions in the first ten when three issuers qualify", () => {
    const result = rankWithCoverageDiversity(manyIssuerCandidates);
    const firstTen = result.items.filter((item) => item.adjustedRank <= 10);
    const nvidiaCount = firstTen.filter((item) => item.issuerId === "company-nvidia").length;
    expect(nvidiaCount).toBeLessThanOrEqual(2);
    expect(nvidiaCount / firstTen.length).toBeLessThanOrEqual(0.3);
    expect(result.adjustments.length).toBeGreaterThan(0);
  });

  it("does not fabricate issuer diversity when only one issuer qualifies", () => {
    const result = rankWithCoverageDiversity(manyIssuerCandidates.slice(0, 4));
    expect(result.items).toHaveLength(4);
    expect(new Set(result.items.map((item) => item.issuerId))).toEqual(new Set(["company-nvidia"]));
  });

  it("does not count sector-wide or macro clusters against issuer concentration", () => {
    const exempt: SectorFeedCandidate[] = [
      { ...candidate("sector", "company-nvidia", 100, "memory"), scope: "sector_wide" },
      { ...candidate("macro", "company-nvidia", 95, "memory"), scope: "macro_to_sector" },
    ];
    const result = rankWithCoverageDiversity([...exempt, ...manyIssuerCandidates]);
    expect(result.items[0]?.scope).toBe("sector_wide");
    expect(result.items.some((item) => item.scope === "macro_to_sector")).toBe(true);
  });
});

describe("sector feed and shared brief", () => {
  const feed = assembleSectorFeed({
    sectorId: "semiconductors",
    marketEdition: "morning",
    marketDate: "2026-07-29",
    candidates: [
      {
        ...candidate("export-controls", "policy", 95, "semiconductor_equipment"),
        scope: "sector_wide",
        issuerId: undefined,
        themes: ["Trade policy"],
        pointsOfAgreement: ["The rule covers multiple equipment categories."],
        uncertainty: ["Implementation timing remains uncertain."],
      },
      {
        ...candidate("foundry-capex", "company-tsmc", 82, "foundries_and_manufacturing"),
        themes: ["Capacity"],
      },
      {
        ...candidate("rates", "federal-reserve", 70, "chip_design_and_compute"),
        scope: "macro_to_sector",
        issuerId: undefined,
        themes: ["Financing conditions"],
      },
    ],
    expectedSubindustryIds: semiconductorsSector.subindustries.map((item) => item.id),
  });

  it("ranks sector-wide first and reports uncovered subindustries", () => {
    expect(feed.items[0]?.scope).toBe("sector_wide");
    expect(feed.coverageGaps.length).toBeGreaterThan(0);
    expect(feed.items.every((item) => item.whyIncluded.length > 0)).toBe(true);
  });

  it("builds one deterministic brief identity per sector, date, and edition", () => {
    const brief = buildSectorBrief({
      sectorName: "Semiconductors",
      feed,
      generatedAt: "2026-07-29T12:00:00.000Z",
    });
    expect(brief.id).toBe("sector-brief-semiconductors-2026-07-29-morning");
    expect(brief.activeClusterIds).toEqual(feed.items.map((item) => item.id));
    expect(brief.sectorWideClusterIds).toEqual(["cluster-export-controls"]);
    expect(brief.companyLedImpactClusterIds).toEqual(["cluster-foundry-capex"]);
    expect(brief.macroToSectorClusterIds).toEqual(["cluster-rates"]);
    expect(brief.demonstrationData).toBe(true);
  });
});

describe("schema and scope boundaries", () => {
  it("validates all supported public-market and macro entity types", () => {
    const entities = [
      ...semiconductorEntityFixtures,
      ...macroTopics,
      ...governmentInstitutionFixtures,
    ];
    expect(entities.every((entity) => EntitySchema.safeParse(entity).success)).toBe(true);
    expect(entities.every((entity) => !entity.entityType.includes("private"))).toBe(true);
  });

  it("validates capability records without implying authorization", () => {
    expect(
      demoSourceRegistry.every((entry) => SourceRegistryEntrySchema.safeParse(entry).success),
    ).toBe(true);
    expect(
      demoSourceRegistry
        .filter((entry) => entry.termsReviewStatus === "not_reviewed")
        .every((entry) => entry.fullTextAvailability !== "licensed"),
    ).toBe(true);
  });

  it("requires source IDs, confidence, explanation, and review status on accepted relations", () => {
    const relation = ClusterEntityRelationSchema.parse({
      clusterId: "cluster-export-controls",
      entityId: "semiconductors",
      relationshipType: "affected",
      clusterScope: "sector_wide",
      materialityScore: 91,
      relevanceScore: 94,
      confidenceLevel: "high",
      whyRelevant: "The primary rule covers several chip categories and subindustries.",
      supportingSourceIds: ["source-rule"],
      directlyNamed: true,
      inferred: false,
      affectedDimensions: ["regulation", "supply"],
      reviewStatus: "accepted",
    });
    expect(relation.supportingSourceIds).not.toHaveLength(0);
    expect(
      ClusterEntityRelationSchema.safeParse({ ...relation, supportingSourceIds: [] }).success,
    ).toBe(false);
  });
});
