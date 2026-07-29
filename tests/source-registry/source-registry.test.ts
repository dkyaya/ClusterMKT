import { OperationalSourceRegistryEntrySchema } from "../../packages/core/src/index";
import { operationalSourceRegistry, sourceFamilies } from "../../packages/config/src/index";
import { describe, expect, it } from "vitest";

describe("operational source registry", () => {
  it("validates every source and retains stable unique identities", () => {
    expect(operationalSourceRegistry).toHaveLength(10);
    expect(new Set(operationalSourceRegistry.map((source) => source.sourceId)).size).toBe(10);
    operationalSourceRegistry.forEach((source) =>
      expect(() => OperationalSourceRegistryEntrySchema.parse(source)).not.toThrow(),
    );
  });
  it("contains no live-ready source", () =>
    expect(
      operationalSourceRegistry.filter((source) => source.futureLiveRetrievalEligible),
    ).toHaveLength(0));
  it("never enables prohibited or unreviewed sources", () =>
    expect(
      operationalSourceRegistry.filter(
        (source) =>
          source.fixtureRetrievalEnabled &&
          ["not_reviewed", "review_required", "restricted", "prohibited", "unknown"].includes(
            source.termsStatus,
          ),
      ),
    ).toHaveLength(0));
  it("has unique source-family IDs", () =>
    expect(new Set(sourceFamilies.map((family) => family.sourceFamilyId)).size).toBe(
      sourceFamilies.length,
    ));
  it("uses only fixture methods with no endpoints", () =>
    expect(
      operationalSourceRegistry
        .flatMap((source) => source.retrievalMethods)
        .every(
          (method) =>
            !method.enabledForFixture || method.endpointClass === "repository-local-fixture",
        ),
    ).toBe(true));
});
