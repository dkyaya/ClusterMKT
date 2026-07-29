import type { EntityAliasRule } from "@cluster-mkt/core";

export const securityAliasRules: EntityAliasRule[] = [
  {
    entityId: "security-smh",
    entityType: "security",
    canonicalName: "Semiconductor fixture ETF",
    exactAliases: ["Semiconductor fixture ETF"],
    caseSensitiveAliases: [],
    tickerAliases: ["SMH"],
    productAliases: [],
    subsidiaryAliases: [],
    executiveAliases: [],
    negativeContexts: [],
    requiredCooccurringTerms: ["ETF", "fund", "shares", "ticker"],
    forbiddenContexts: [],
    minimumMatchStrength: "contextual",
    reviewRule: "require_context",
  },
];
