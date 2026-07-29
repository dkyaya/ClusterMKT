import { z } from "zod";

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
