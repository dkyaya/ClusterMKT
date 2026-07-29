import type { EntityAliasRule } from "@cluster-mkt/core";
import { macroTopics } from "../macro-topics";

export const macroTopicAliasRules: EntityAliasRule[] = macroTopics.map((topic) => ({
  entityId: topic.id,
  entityType: "macro_topic",
  canonicalName: topic.displayName,
  exactAliases: [topic.displayName, ...topic.aliases],
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
}));
