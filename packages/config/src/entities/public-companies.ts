import type { EntityAliasRule } from "@cluster-mkt/core";

const company = (
  entityId: string,
  canonicalName: string,
  tickerAliases: readonly string[],
  options: Partial<EntityAliasRule> = {},
): EntityAliasRule => ({
  entityId,
  entityType: "public_company",
  canonicalName,
  exactAliases: [canonicalName],
  caseSensitiveAliases: [],
  tickerAliases,
  productAliases: [],
  subsidiaryAliases: [],
  executiveAliases: [],
  negativeContexts: [],
  requiredCooccurringTerms: [],
  forbiddenContexts: [],
  minimumMatchStrength: "strong",
  reviewRule: "accept_explicit",
  ...options,
});

export const publicCompanyAliasRules: EntityAliasRule[] = [
  company("company-nvidia", "Nvidia", ["NVDA"], {
    exactAliases: ["Nvidia", "NVIDIA"],
    productAliases: ["GeForce", "CUDA", "Blackwell"],
    executiveAliases: ["Jensen Huang"],
  }),
  company("company-amd", "Advanced Micro Devices", ["AMD"], {
    exactAliases: ["Advanced Micro Devices", "AMD"],
    productAliases: ["Ryzen", "Instinct"],
  }),
  company("company-tsmc", "Taiwan Semiconductor Manufacturing Company", ["TSM"], {
    exactAliases: ["Taiwan Semiconductor Manufacturing Company", "TSMC"],
  }),
  company("company-asml", "ASML Holding", ["ASML"], { exactAliases: ["ASML Holding", "ASML"] }),
  company("company-broadcom", "Broadcom", ["AVGO"], {
    productAliases: ["Tomahawk"],
  }),
  company("company-on-semiconductor", "ON Semiconductor", ["ON"], {
    exactAliases: ["ON Semiconductor", "onsemi"],
    requiredCooccurringTerms: ["semiconductor", "shares", "ticker", "earnings"],
    reviewRule: "require_context",
  }),
  company("company-c3-ai", "C3.ai", ["AI"], {
    exactAliases: ["C3.ai", "C3 AI"],
    requiredCooccurringTerms: ["C3", "shares", "ticker", "earnings"],
    reviewRule: "require_context",
  }),
  company("company-caterpillar", "Caterpillar", ["CAT"], {
    requiredCooccurringTerms: ["Caterpillar", "shares", "ticker", "equipment"],
    reviewRule: "require_context",
  }),
  company("company-servicenow", "ServiceNow", ["NOW"], {
    requiredCooccurringTerms: ["ServiceNow", "shares", "ticker", "software"],
    reviewRule: "require_context",
  }),
  company("company-meta", "Meta Platforms", ["META"], {
    exactAliases: ["Meta Platforms", "Facebook parent"],
    requiredCooccurringTerms: ["Platforms", "shares", "ticker", "Facebook"],
    forbiddenContexts: ["meta-analysis", "meta analysis"],
    reviewRule: "require_context",
  }),
  company("company-apple", "Apple", ["AAPL"], {
    requiredCooccurringTerms: ["iPhone", "Mac", "shares", "company"],
    forbiddenContexts: ["fruit", "orchard"],
    reviewRule: "require_context",
  }),
  company("company-amazon", "Amazon.com", ["AMZN"], {
    exactAliases: ["Amazon.com", "Amazon"],
    requiredCooccurringTerms: ["AWS", "Prime", "company", "shares"],
    forbiddenContexts: ["river", "rainforest", "region"],
    reviewRule: "require_context",
  }),
  company("company-alphabet", "Alphabet", ["GOOGL", "GOOG"], {
    exactAliases: ["Alphabet", "Google parent"],
    requiredCooccurringTerms: ["Google", "shares", "company"],
    forbiddenContexts: ["letters", "language"],
    reviewRule: "require_context",
  }),
];
