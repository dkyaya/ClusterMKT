import type {
  NormalizationConfidence,
  NormalizationReviewStatus,
} from "../schemas/normalization-decision";

export interface UrlNormalizationRules {
  trackingParameterNames: readonly string[];
  trackingParameterPrefixes: readonly string[];
  significantParameterNames: readonly string[];
  mobileHostAliases: Readonly<Record<string, string>>;
  printParameterRules: Readonly<Record<string, readonly string[]>>;
  ampPathHosts: readonly string[];
}

export interface UrlNormalizationResult {
  inputUrl: string;
  normalizedUrl?: string;
  removedParameters: string[];
  preservedParameters: string[];
  appliedRules: string[];
  confidence: NormalizationConfidence;
  reviewRequired: boolean;
  reviewStatus: NormalizationReviewStatus;
  explanationCodes: string[];
}

export interface EntityAliasRule {
  entityId: string;
  entityType:
    | "public_company"
    | "security"
    | "sector"
    | "industry"
    | "subindustry"
    | "macro_topic"
    | "government_agency"
    | "economic_indicator";
  canonicalName: string;
  exactAliases: readonly string[];
  caseSensitiveAliases: readonly string[];
  tickerAliases: readonly string[];
  productAliases: readonly string[];
  subsidiaryAliases: readonly string[];
  executiveAliases: readonly string[];
  negativeContexts: readonly string[];
  requiredCooccurringTerms: readonly string[];
  forbiddenContexts: readonly string[];
  minimumMatchStrength: "strong" | "contextual" | "review";
  reviewRule: "accept_explicit" | "require_context" | "always_review";
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface DeduplicationRules {
  headlineSimilarityThreshold: number;
  abstractSimilarityThreshold: number;
  publicationWindowMinutes: number;
  distinctivePhraseMinimumTokens: number;
}
