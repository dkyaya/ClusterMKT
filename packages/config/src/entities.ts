import { EntitySchema, type Entity } from "@cluster-mkt/core";
import { semiconductorCompanyFixtures } from "./sectors/semiconductors";

export const semiconductorEntityFixtures: Entity[] = semiconductorCompanyFixtures.map((company) =>
  EntitySchema.parse({
    id: company.id,
    displayName: company.displayName,
    entityType: "public_company",
    aliases: [company.displayName],
    ticker: company.ticker,
    exchange: "fixture-exchange",
    parentSectorId: "semiconductors",
    parentIndustryId: "semiconductor_industry",
    parentSubindustryId: company.subindustryId,
    active: true,
  }),
);

export function findDuplicateEntityAliases(entities: Entity[]): string[] {
  const counts = new Map<string, number>();
  for (const entity of entities) {
    for (const alias of entity.aliases) {
      const normalized = alias.trim().toLowerCase();
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([alias]) => alias)
    .sort();
}
