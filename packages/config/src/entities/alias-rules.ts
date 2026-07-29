import type { EntityAliasRule } from "@cluster-mkt/core";
import { semiconductorsSector } from "../sectors/semiconductors";
import { institutionAliasRules } from "./institutions";
import { macroTopicAliasRules } from "./macro-topics";
import { publicCompanyAliasRules } from "./public-companies";
import { securityAliasRules } from "./securities";

const sectorRules: EntityAliasRule[] = [
  {
    entityId: semiconductorsSector.id,
    entityType: "sector",
    canonicalName: semiconductorsSector.name,
    exactAliases: ["Semiconductors", "semiconductor sector", "chip industry"],
    caseSensitiveAliases: [],
    tickerAliases: [],
    productAliases: [],
    subsidiaryAliases: [],
    executiveAliases: [],
    negativeContexts: [],
    requiredCooccurringTerms: [],
    forbiddenContexts: [],
    minimumMatchStrength: "strong",
    reviewRule: "accept_explicit",
  },
  ...semiconductorsSector.subindustries.map((subindustry) => ({
    entityId: subindustry.id,
    entityType: "subindustry" as const,
    canonicalName: subindustry.displayName,
    exactAliases: [subindustry.displayName, ...subindustry.commonTerminology],
    caseSensitiveAliases: [],
    tickerAliases: [],
    productAliases: [],
    subsidiaryAliases: [],
    executiveAliases: [],
    negativeContexts: [],
    requiredCooccurringTerms: [],
    forbiddenContexts: [],
    minimumMatchStrength: "strong" as const,
    reviewRule: "accept_explicit" as const,
  })),
];

export const entityAliasRules: EntityAliasRule[] = [
  ...publicCompanyAliasRules,
  ...securityAliasRules,
  ...macroTopicAliasRules,
  ...institutionAliasRules,
  ...sectorRules,
];

export interface DuplicateAliasConflict {
  alias: string;
  entityIds: string[];
}

export function findAliasConflicts(rules: readonly EntityAliasRule[]): DuplicateAliasConflict[] {
  const owners = new Map<string, Set<string>>();
  for (const rule of rules) {
    const aliases = [
      ...rule.exactAliases,
      ...rule.caseSensitiveAliases,
      ...rule.tickerAliases,
      ...rule.productAliases,
      ...rule.subsidiaryAliases,
      ...rule.executiveAliases,
    ];
    for (const alias of aliases) {
      const key = alias.normalize("NFKC").trim().toLocaleLowerCase("en-US");
      const values = owners.get(key) ?? new Set<string>();
      values.add(rule.entityId);
      owners.set(key, values);
    }
  }
  return [...owners.entries()]
    .filter(([, ids]) => ids.size > 1)
    .map(([alias, ids]) => ({ alias, entityIds: [...ids].sort() }))
    .sort((left, right) => left.alias.localeCompare(right.alias));
}
