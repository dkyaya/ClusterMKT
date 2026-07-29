import type { DeduplicationRules } from "@cluster-mkt/core";

export const deduplicationRules: DeduplicationRules = {
  headlineSimilarityThreshold: 0.92,
  abstractSimilarityThreshold: 0.88,
  publicationWindowMinutes: 180,
  distinctivePhraseMinimumTokens: 6,
};
