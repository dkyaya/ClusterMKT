import { z } from "zod";
import { OperationalSourceCapabilitySchema } from "./source-capability";
import { RetrievalMethodConfigSchema } from "./retrieval-method";
import {
  LiveEligibilitySchema,
  OperationalTermsStatusSchema,
  TechnicalReviewStatusSchema,
} from "./source-terms-status";

export const SourceCategorySchema = z.enum([
  "government_primary",
  "company_primary",
  "regulatory_primary",
  "financial_news",
  "general_news",
  "trade_publication",
  "podcast",
  "research_or_analysis",
]);
export const SourceClassificationSchema = z.enum(["primary", "secondary"]);
export const SourceCapabilitySchema = z.enum(["none", "unknown", "available"]);
export const FullTextAvailabilitySchema = z.enum(["unavailable", "unknown", "public", "licensed"]);
export const TermsReviewStatusSchema = z.enum([
  "not_reviewed",
  "metadata_only",
  "public_primary_source",
  "authorized_feed",
  "requires_manual_review",
]);
export const EditorialTierSchema = z.enum(["primary", "established", "specialist", "unrated"]);

export const SourceRegistryEntrySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  publisherName: z.string().min(1),
  sourceCategory: SourceCategorySchema,
  classification: SourceClassificationSchema,
  typicalSpecialties: z.array(z.string().min(1)),
  feedCapability: SourceCapabilitySchema,
  apiCapability: SourceCapabilitySchema,
  publicMetadataAvailable: z.boolean(),
  abstractAvailable: z.boolean(),
  fullTextAvailability: FullTextAvailabilitySchema,
  podcastCapability: SourceCapabilitySchema,
  transcriptCapability: SourceCapabilitySchema,
  accessType: z.enum(["public", "registration", "subscription", "mixed", "unknown"]),
  paywallLikelihood: z.enum(["none", "low", "medium", "high", "unknown"]),
  termsReviewStatus: TermsReviewStatusSchema,
  updateFrequency: z.string().min(1),
  knownTaggingProblems: z.array(z.string().min(1)),
  editorialTier: EditorialTierSchema,
  permittedForFixtureEvidence: z.boolean(),
  notes: z.string().min(1),
});

export type SourceRegistryEntry = z.infer<typeof SourceRegistryEntrySchema>;

export const OperationalSourceRegistryEntrySchema = z
  .object({
    sourceId: z.string().regex(/^[a-z0-9-]+$/),
    publisherName: z.string().min(1),
    sourceFamilyId: z.string().regex(/^[a-z0-9-]+$/),
    sourceCategory: SourceCategorySchema,
    classification: SourceClassificationSchema,
    geographicScope: z.array(z.string().min(1)).min(1),
    topicSpecialties: z.array(z.string().min(1)),
    supportedContentTypes: z.array(z.string().min(1)).min(1),
    retrievalMethods: z.array(RetrievalMethodConfigSchema),
    capabilities: OperationalSourceCapabilitySchema,
    authenticationRequired: z.boolean(),
    subscriptionLikelihood: z.enum(["none", "low", "medium", "high", "unknown"]),
    paywallLikelihood: z.enum(["none", "low", "medium", "high", "unknown"]),
    termsStatus: OperationalTermsStatusSchema,
    technicalStatus: TechnicalReviewStatusSchema,
    legalReviewStatus: z.enum([
      "not_reviewed",
      "fixture_reviewed",
      "review_required",
      "restricted",
    ]),
    liveEligibility: LiveEligibilitySchema,
    retrievalFrequencyCeilingMinutes: z.number().int().positive(),
    retryPolicyId: z.string().min(1),
    rateLimitPolicyId: z.string().min(1),
    userAgentRequirement: z.string().min(1),
    attributionRequirement: z.string().min(1),
    knownDuplicateBehavior: z.array(z.string().min(1)),
    knownSyndicationBehavior: z.array(z.string().min(1)),
    knownCanonicalUrlBehavior: z.array(z.string().min(1)),
    knownUpdateBehavior: z.array(z.string().min(1)),
    knownTaggingProblems: z.array(z.string().min(1)),
    fixtureRetrievalEnabled: z.boolean(),
    futureLiveRetrievalEligible: z.boolean(),
    notes: z.string().min(1),
    effectiveDate: z.iso.date(),
    registryVersion: z.string().regex(/^source-registry-v\d+$/),
  })
  .superRefine((source, context) => {
    if (source.futureLiveRetrievalEligible || source.liveEligibility !== "fixture_only") {
      context.addIssue({
        code: "custom",
        message: "The offline foundation permits fixture-only sources and no live-ready state.",
      });
    }
    const permittedTerms = new Set([
      "metadata_only_approved_fixture",
      "public_primary_source_fixture",
      "authorized_feed_fixture",
    ]);
    if (source.fixtureRetrievalEnabled && !permittedTerms.has(source.termsStatus)) {
      context.addIssue({
        code: "custom",
        message: "Fixture retrieval requires an explicitly reviewed fixture terms status.",
      });
    }
    if (
      source.retrievalMethods.some(
        (method) => method.method === "prohibited_scrape" && method.enabledForFixture,
      )
    ) {
      context.addIssue({ code: "custom", message: "Prohibited scraping cannot be enabled." });
    }
  });

export type OperationalSourceRegistryEntry = z.infer<typeof OperationalSourceRegistryEntrySchema>;
