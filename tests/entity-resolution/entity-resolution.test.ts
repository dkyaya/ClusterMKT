import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveEntities } from "../../packages/core/src/index";
import {
  NORMALIZATION_RULES_VERSION,
  entityAliasRules,
  findAliasConflicts,
} from "../../packages/config/src/index";

interface EntityCorpusCase {
  id: string;
  inputRecords: unknown[];
  expectedNormalizedResult: Record<string, unknown>;
  expectedEntityDecisions: Array<{ entityId: string; status: string }>;
  expectedDuplicateOrVersionRelationship: string;
  expectedEventRelationship: string;
  expectedReviewStatus: string;
  expectedExplanationCodes: string[];
}

const corpus = JSON.parse(
  readFileSync(
    resolve(process.cwd(), "tests/fixtures/entity-resolution/entity-resolution-cases.json"),
    "utf8",
  ),
) as EntityCorpusCase[];

const resolveHeadline = (headline: string, sourceTags?: string[]) =>
  resolveEntities(
    `raw-${headline.length}`,
    { headline, ...(sourceTags ? { sourceTags } : {}) },
    entityAliasRules,
    NORMALIZATION_RULES_VERSION,
  );

describe("80-case corpus contract: entity portion", () => {
  it("contains the required 23 entity-resolution cases", () => {
    expect(corpus).toHaveLength(23);
    expect(new Set(corpus.map((fixture) => fixture.id)).size).toBe(23);
  });

  it.each(corpus)("keeps complete machine-readable expectations for $id", (fixture) => {
    expect(fixture.inputRecords.length).toBeGreaterThan(0);
    expect(Object.keys(fixture.expectedNormalizedResult).length).toBeGreaterThan(0);
    expect(fixture.expectedEntityDecisions.length).toBeGreaterThan(0);
    expect(fixture.expectedDuplicateOrVersionRelationship).toBeTruthy();
    expect(fixture.expectedEventRelationship).toBeTruthy();
    expect(fixture.expectedReviewStatus).toBeTruthy();
    expect(fixture.expectedExplanationCodes.length).toBeGreaterThan(0);
  });
});

describe("explicit names, tickers, products, sectors, and institutions", () => {
  it.each([
    ["Nvidia raises guidance", "company-nvidia"],
    ["NVDA shares rise after earnings", "company-nvidia"],
    ["TSMC capacity plans expand", "company-tsmc"],
    ["TSM shares respond to foundry guidance", "company-tsmc"],
    ["ASML reports equipment orders", "company-asml"],
    ["Broadcom updates product demand", "company-broadcom"],
    ["Federal Reserve changes monetary policy", "agency-federal-reserve"],
    ["Bureau of Labor Statistics publishes employment data", "agency-bls"],
    ["Semiconductor sector capacity changes", "semiconductors"],
    ["Inflation changes interest rates", "inflation"],
  ])("accepts configured explicit context: %s", (headline, entityId) => {
    expect(resolveHeadline(headline).acceptedEntityIds).toContain(entityId);
  });

  it("distinguishes candidate generation from acceptance for product and untrusted-tag matches", () => {
    const productOnly = resolveHeadline("Blackwell demand grows");
    expect(
      productOnly.candidates.some((candidate) => candidate.candidateEntityId === "company-nvidia"),
    ).toBe(true);
    expect(productOnly.acceptedEntityIds).not.toContain("company-nvidia");
    expect(productOnly.reviewRequiredEntityIds).toContain("company-nvidia");
    const tagOnly = resolveHeadline("Unrelated fixture story", ["NVDA"]);
    expect(tagOnly.acceptedEntityIds).not.toContain("company-nvidia");
    expect(tagOnly.reviewRequiredEntityIds).toContain("company-nvidia");
  });

  it("accepts executive or product aliases only when company context corroborates them", () => {
    expect(resolveHeadline("Jensen Huang discusses Nvidia guidance").acceptedEntityIds).toContain(
      "company-nvidia",
    );
    expect(resolveHeadline("Nvidia Blackwell demand expands").acceptedEntityIds).toContain(
      "company-nvidia",
    );
  });

  it("flags duplicate aliases across entities for explicit adjudication", () => {
    const conflicts = findAliasConflicts(entityAliasRules);
    expect(conflicts).toContainEqual({
      alias: "federal reserve",
      entityIds: ["agency-federal-reserve", "federal_reserve"],
    });
  });
});

describe("ambiguous ticker and ordinary-language defenses", () => {
  const ordinaryLanguage = [
    "Production resumes on Monday",
    "Artificial intelligence demand grows",
    "A cat supply survey is available",
    "Now expects the work to continue",
    "A meta-analysis reviews best practices",
    "It remains unclear",
    "All companies are likely affected",
    "A new rule is open for comment",
    "Consumer confidence improves",
    "Fast growth may slow",
    "Real rates remain elevated",
    "Work continues on Monday",
    "Best practices are useful",
    "Life goes on",
    "Love of play appears in the article",
    "The race may run longer",
    "Good results are possible",
    "C is a letter in the ordinary alphabet",
    "F is another letter in the ordinary alphabet",
    "T is used as a variable in this sentence",
    "OPEN questions remain in the survey",
    "REAL rates are an economic concept",
    "FAST growth is descriptive prose",
    "RACE conditions are discussed generically",
    "RUN the fixture again",
    "PLAY continues after the interval",
    "WORK remains underway",
    "GOOD practice is documented",
    "BEST practice is documented",
  ];

  it.each(ordinaryLanguage)("accepts zero company or security matches for: %s", (headline) => {
    const decision = resolveHeadline(headline);
    const acceptedMarketEntities = decision.candidates.filter(
      (candidate) =>
        candidate.accepted &&
        (candidate.entityType === "public_company" || candidate.entityType === "security"),
    );
    expect(acceptedMarketEntities).toHaveLength(0);
  });

  it("rejects uppercase ambiguous tokens without corroborating financial context", () => {
    for (const headline of [
      "ON MONDAY THE WORK CONTINUES",
      "AI DEMAND IS A GENERIC PHRASE",
      "CAT SUPPLY APPEARS IN A PET SURVEY",
      "NOW EXPECTS AN OPEN QUESTION",
      "META-ANALYSIS REVIEWS RESEARCH",
    ]) {
      const decision = resolveHeadline(headline);
      expect(
        decision.candidates.filter(
          (candidate) => candidate.mentionType === "ticker_mention" && candidate.accepted,
        ),
      ).toHaveLength(0);
    }
  });

  it("separates Apple, Amazon, and Alphabet companies from ordinary meanings", () => {
    expect(resolveHeadline("Apple company shares rise").acceptedEntityIds).toContain(
      "company-apple",
    );
    expect(resolveHeadline("Apple fruit harvest grows").acceptedEntityIds).not.toContain(
      "company-apple",
    );
    expect(
      resolveHeadline("Amazon rainforest region receives rain").acceptedEntityIds,
    ).not.toContain("company-amazon");
    expect(resolveHeadline("The alphabet contains letters").acceptedEntityIds).not.toContain(
      "company-alphabet",
    );
  });
});
