import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  RawSourceRecordSchema,
  SourceContentSchema,
  classifyArticleVersion,
  detectDuplicate,
  detectSyndication,
  normalizeRawSourceRecord,
  normalizeSourceUrl,
  type RawSourceRecord,
} from "../../packages/core/src/index";
import {
  NORMALIZATION_RULES_VERSION,
  entityAliasRules,
  urlNormalizationRules,
} from "../../packages/config/src/index";

interface CorpusCase {
  id: string;
  inputRecords: unknown[];
  expectedNormalizedResult: Record<string, unknown>;
  expectedEntityDecisions: unknown[];
  expectedDuplicateOrVersionRelationship: string;
  expectedEventRelationship: string;
  expectedReviewStatus: string;
  expectedExplanationCodes: string[];
}

const corpus = JSON.parse(
  readFileSync(
    resolve(process.cwd(), "tests/fixtures/normalization/source-normalization-cases.json"),
    "utf8",
  ),
) as CorpusCase[];

const checksumA = "a".repeat(64);
const checksumB = "b".repeat(64);
function raw(overrides: Partial<RawSourceRecord> = {}): RawSourceRecord {
  return RawSourceRecordSchema.parse({
    rawRecordId: "raw-a",
    sourceRegistryId: "fixture-desk",
    sourceFamilyId: "family-fixture-desk",
    originalUrl: "https://www.fixture-financial.test/story?id=1",
    headline: "Nvidia raises semiconductor guidance",
    publisherAbstract: "Nvidia shares and supplier demand are discussed in the fixture abstract.",
    authorNames: ["Fixture Reporter"],
    publishedAt: "2026-07-29T12:00:00.000Z",
    retrievedAt: "2026-07-29T12:05:00.000Z",
    language: "en",
    contentType: "article",
    accessType: "public",
    paywallStatus: "none",
    sourceRole: "secondary",
    transcriptStatus: "not_applicable",
    metadataChecksum: checksumA,
    sourceProvidedArticleId: "article-a",
    feedEntryId: "feed-a",
    originalMetadataPayloadRef: "fixtures/raw-a.json",
    termsReviewStatus: "requires_manual_review",
    textAvailable: false,
    metadataOnly: false,
    fixtureStatus: "fixture",
    ...overrides,
  });
}

describe("80-case corpus contract: source portion", () => {
  it("contains the required 42 normalization, evidence, and quarantine cases", () => {
    expect(corpus).toHaveLength(42);
    expect(new Set(corpus.map((fixture) => fixture.id)).size).toBe(42);
  });

  it.each(corpus)("keeps every expectation machine-readable for $id", (fixture) => {
    expect(fixture.inputRecords.length).toBeGreaterThan(0);
    expect(Object.keys(fixture.expectedNormalizedResult).length).toBeGreaterThan(0);
    expect(fixture.expectedDuplicateOrVersionRelationship).toBeTruthy();
    expect(fixture.expectedEventRelationship).toBeTruthy();
    expect(fixture.expectedReviewStatus).toMatch(/accepted|review_required|quarantined|rejected/);
    expect(fixture.expectedExplanationCodes.length).toBeGreaterThan(0);
  });
});

describe("deterministic URL normalization", () => {
  it.each([
    [
      "utm",
      "https://www.fixture-financial.test/story?utm_source=x&id=7",
      "https://www.fixture-financial.test/story?id=7",
    ],
    [
      "fragment",
      "https://www.fixture-financial.test/story#part",
      "https://www.fixture-financial.test/story",
    ],
    [
      "print",
      "https://www.fixture-financial.test/story?output=print&id=7",
      "https://www.fixture-financial.test/story?id=7",
    ],
    [
      "amp",
      "https://www.fixture-financial.test/story/amp",
      "https://www.fixture-financial.test/story",
    ],
    [
      "mobile",
      "https://m.fixture-financial.test/story",
      "https://www.fixture-financial.test/story",
    ],
  ])("normalizes the configured %s case without a fetch", (_label, input, expected) => {
    expect(normalizeSourceUrl(input, urlNormalizationRules).normalizedUrl).toBe(expected);
  });

  it("preserves significant and unknown query values and sorts them", () => {
    const result = normalizeSourceUrl(
      "https://example.test/story?opaque=keep&id=9&a=1",
      urlNormalizationRules,
    );
    expect(result.normalizedUrl).toBe("https://example.test/story?a=1&id=9&opaque=keep");
    expect(result.preservedParameters).toEqual(["opaque", "id", "a"]);
    expect(result.reviewRequired).toBe(true);
  });

  it("quarantines malformed URLs and preserves path case", () => {
    expect(normalizeSourceUrl("not a url", urlNormalizationRules).reviewStatus).toBe("quarantined");
    expect(
      normalizeSourceUrl("https://example.test/Story", urlNormalizationRules).normalizedUrl,
    ).not.toBe(
      normalizeSourceUrl("https://example.test/story", urlNormalizationRules).normalizedUrl,
    );
  });

  it("normalizes IDNs and safe percent encoding through the platform URL parser", () => {
    const result = normalizeSourceUrl("https://例え.テスト/a%7Eb", urlNormalizationRules);
    expect(result.normalizedUrl).toContain("xn--r8jz45g.xn--zckzah/a~b");
  });
});

describe("duplicate, syndication, and version boundaries", () => {
  it("detects source IDs, checksums, feed entries, and raw-ID collisions as exact duplicates", () => {
    expect(detectDuplicate(raw(), raw()).relationship).toBe("exact_duplicate");
    expect(
      detectDuplicate(raw(), raw({ rawRecordId: "raw-b", feedEntryId: "feed-b" })).relationship,
    ).toBe("exact_duplicate");
    expect(
      detectDuplicate(
        raw({ sourceProvidedArticleId: undefined, contentChecksum: checksumB }),
        raw({
          rawRecordId: "raw-b",
          sourceProvidedArticleId: undefined,
          contentChecksum: checksumB,
          metadataChecksum: checksumB,
        }),
      ).explanationCodes,
    ).toContain("DUPLICATE_CONTENT_CHECKSUM");
  });

  it("does not call independent reporting syndicated merely because the event is similar", () => {
    const decision = detectSyndication(
      raw(),
      raw({
        rawRecordId: "raw-b",
        sourceRegistryId: "independent-desk",
        sourceFamilyId: "family-independent",
        sourceProvidedArticleId: "independent-b",
        feedEntryId: "feed-b",
        metadataChecksum: checksumB,
        headline: "Independent desk examines Nvidia guidance and suppliers",
      }),
      NORMALIZATION_RULES_VERSION,
    );
    expect(decision.relationship).toBe("independent_reporting");
    expect(decision.countsAsIndependentConfirmation).toBe(true);
  });

  it("counts an attributed, sufficiently similar republication as one syndication family", () => {
    const decision = detectSyndication(
      raw({
        fixtureText: "Reuters Nvidia raises semiconductor guidance supplier demand",
        textAvailable: true,
      }),
      raw({
        rawRecordId: "raw-b",
        sourceRegistryId: "republisher",
        sourceFamilyId: "family-republisher",
        sourceProvidedArticleId: "republished-b",
        feedEntryId: "feed-b",
        metadataChecksum: checksumB,
        fixtureText: "Reuters Nvidia raises semiconductor guidance supplier demand",
        textAvailable: true,
      }),
      NORMALIZATION_RULES_VERSION,
    );
    expect(decision.relationship).toBe("attributed_republication");
    expect(decision.countsAsIndependentConfirmation).toBe(false);
  });

  it("links headline updates and material revisions while keeping follow-up works distinct", () => {
    const previous = raw();
    const headlineUpdate = classifyArticleVersion(
      previous,
      raw({
        rawRecordId: "raw-b",
        headline: "Nvidia raises guidance — updated",
        metadataChecksum: checksumB,
      }),
      undefined,
      NORMALIZATION_RULES_VERSION,
    );
    expect(headlineUpdate.relationship).toBe("updated_version");
    expect(headlineUpdate.version.versionNumber).toBe(2);
    const material = classifyArticleVersion(
      previous,
      raw({
        rawRecordId: "raw-c",
        publisherAbstract: "Materially revised fixture claim.",
        metadataChecksum: checksumB,
      }),
      undefined,
      NORMALIZATION_RULES_VERSION,
    );
    expect(material.relationship).toBe("materially_revised_version");
    const followUp = classifyArticleVersion(
      previous,
      raw({
        rawRecordId: "raw-d",
        sourceProvidedArticleId: "analysis-d",
        originalUrl: "https://www.fixture-financial.test/analysis",
        headline: "Follow-up analysis of supplier effects",
        metadataChecksum: checksumB,
      }),
      undefined,
      NORMALIZATION_RULES_VERSION,
      true,
    );
    expect(followUp.relationship).toBe("new_article_same_event");
    expect(followUp.sameUnderlyingWork).toBe(false);
  });
});

describe("raw evidence and provenance pipeline", () => {
  it("supports metadata-only records without inventing empty verified text", () => {
    expect(
      RawSourceRecordSchema.safeParse(raw({ metadataOnly: true, textAvailable: false })).success,
    ).toBe(true);
    expect(SourceContentSchema.safeParse({ availability: "abstract", headline: "A" }).success).toBe(
      false,
    );
  });

  it("emits a normalized record with raw provenance, explanation codes, and rules version", () => {
    const result = normalizeRawSourceRecord(raw(), {
      rulesVersion: NORMALIZATION_RULES_VERSION,
      processedAt: "2026-07-29T13:00:00.000Z",
      urlRules: urlNormalizationRules,
      entityRules: entityAliasRules,
      knownSources: { "fixture-desk": "Fixture Financial Desk" },
      event: {
        id: "event-guidance-a",
        eventType: "guidance",
        primaryEntityIds: ["company-nvidia"],
        action: "raises guidance",
        sourceFamilyEvidence: ["family-fixture-desk"],
      },
    });
    expect(result.route).toBe("accepted");
    expect(result.normalizedRecord?.contributingRawRecordIds).toEqual(["raw-a"]);
    expect(result.normalizedRecord?.provenanceReferences).toHaveLength(1);
    expect(result.normalizedRecord?.rulesVersion).toBe("normalization-v1");
    expect(result.decisions.map((decision) => decision.stage)).toContain("routing");
    expect(result.decisions.every((decision) => decision.explanationCodes.length > 0)).toBe(true);
  });

  it("retains invalid, missing-date, unknown-source, and unsupported-language records", () => {
    const options = {
      rulesVersion: NORMALIZATION_RULES_VERSION,
      processedAt: "2026-07-29T13:00:00.000Z",
      urlRules: urlNormalizationRules,
      entityRules: entityAliasRules,
      knownSources: { "fixture-desk": "Fixture Financial Desk" },
    };
    const invalid = normalizeRawSourceRecord({ rawRecordId: "broken" }, options);
    expect(invalid).toMatchObject({ route: "quarantined", retained: true });
    const missingDate = normalizeRawSourceRecord(raw({ publishedAt: undefined }), options);
    expect(missingDate).toMatchObject({ route: "review_required", retained: true });
    const unknown = normalizeRawSourceRecord(raw({ sourceRegistryId: "unknown" }), options);
    expect(unknown).toMatchObject({ route: "quarantined", retained: true });
    const unsupported = normalizeRawSourceRecord(raw({ language: "zz" }), options);
    expect(unsupported).toMatchObject({ route: "quarantined", retained: true });
  });
});
