import { describe, expect, it } from "vitest";
import {
  findDuplicateEntityAliases,
  governmentInstitutionFixtures,
  macroTopics,
  semiconductorCompanyFixtures,
  semiconductorEntityFixtures,
  semiconductorsSector,
} from "../index";

describe("semiconductor editorial taxonomy", () => {
  it("has unique stable IDs and consistent representative companies", () => {
    const ids = semiconductorsSector.subindustries.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const company of semiconductorCompanyFixtures) {
      const subindustry = semiconductorsSector.subindustries.find(
        (item) => item.id === company.subindustryId,
      );
      expect(subindustry?.representativePublicCompanyIds).toContain(company.id);
    }
  });

  it("keeps all subindustries inside the project-owned Semiconductors sector", () => {
    expect(semiconductorsSector.id).toBe("semiconductors");
    expect(semiconductorsSector.editorialTaxonomyVersion).toBe("cluster-mkt-semiconductors-v1");
    expect(semiconductorsSector.industries[0]?.subindustryIds).toEqual(
      semiconductorsSector.subindustries.map((item) => item.id),
    );
  });

  it("uses valid upstream and downstream references", () => {
    const valid = new Set(semiconductorsSector.subindustries.map((item) => item.id));
    for (const subindustry of semiconductorsSector.subindustries) {
      for (const reference of [
        ...subindustry.upstreamSubindustryIds,
        ...subindustry.downstreamSubindustryIds,
      ]) {
        expect(valid.has(reference)).toBe(true);
      }
    }
  });

  it("detects duplicate aliases in representative fixtures", () => {
    const aliases = semiconductorEntityFixtures.flatMap((entity) =>
      entity.aliases.map((alias) => alias.toLowerCase()),
    );
    expect(new Set(aliases).size).toBe(aliases.length);
    expect(
      findDuplicateEntityAliases([
        semiconductorEntityFixtures[0]!,
        {
          ...semiconductorEntityFixtures[1]!,
          aliases: [semiconductorEntityFixtures[0]!.aliases[0]!],
        },
      ]),
    ).toEqual([semiconductorEntityFixtures[0]!.aliases[0]!.toLowerCase()]);
  });

  it("contains no private-market entity categories and is serializable", () => {
    const allEntities = [
      ...semiconductorEntityFixtures,
      ...macroTopics,
      ...governmentInstitutionFixtures,
    ];
    expect(allEntities.every((entity) => !entity.entityType.includes("private"))).toBe(true);
    const serialized = JSON.stringify(semiconductorsSector);
    expect(serialized).toContain('"id":"semiconductors"');
  });
});
