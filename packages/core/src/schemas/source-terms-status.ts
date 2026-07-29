import { z } from "zod";

export const OperationalTermsStatusSchema = z.enum([
  "not_reviewed",
  "review_required",
  "metadata_only_approved_fixture",
  "public_primary_source_fixture",
  "authorized_feed_fixture",
  "restricted",
  "prohibited",
  "unknown",
]);

export const TechnicalReviewStatusSchema = z.enum([
  "untested",
  "fixture_only",
  "capability_confirmed_offline",
  "live_connection_not_configured",
  "unsupported",
  "blocked",
]);

export const LiveEligibilitySchema = z.enum([
  "not_eligible",
  "future_review_required",
  "future_eligible_pending_credentials",
  "future_eligible_pending_terms",
  "fixture_only",
]);

export type OperationalTermsStatus = z.infer<typeof OperationalTermsStatusSchema>;
export type TechnicalReviewStatus = z.infer<typeof TechnicalReviewStatusSchema>;
export type LiveEligibility = z.infer<typeof LiveEligibilitySchema>;
