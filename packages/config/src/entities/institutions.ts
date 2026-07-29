import type { EntityAliasRule } from "@cluster-mkt/core";

const institution = (
  entityId: string,
  canonicalName: string,
  exactAliases: readonly string[],
): EntityAliasRule => ({
  entityId,
  entityType: "government_agency",
  canonicalName,
  exactAliases,
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
});

export const institutionAliasRules: EntityAliasRule[] = [
  institution("agency-federal-reserve", "Federal Reserve", ["Federal Reserve", "Fed"]),
  institution("agency-bls", "Bureau of Labor Statistics", ["Bureau of Labor Statistics", "BLS"]),
  institution("agency-bea", "Bureau of Economic Analysis", ["Bureau of Economic Analysis", "BEA"]),
  institution("agency-us-treasury", "U.S. Treasury", ["U.S. Treasury", "US Treasury"]),
  institution("agency-sec", "Securities and Exchange Commission", [
    "Securities and Exchange Commission",
    "SEC",
  ]),
];
