export const futureCredentialRequirements = [
  {
    sourceClass: "sec_public_data",
    credential: null,
    readiness: "no_key_expected",
    liveEnabled: false,
  },
  {
    sourceClass: "approved_public_rss_atom",
    credential: null,
    readiness: "no_key_expected",
    liveEnabled: false,
  },
  {
    sourceClass: "approved_public_podcast_rss",
    credential: null,
    readiness: "no_key_expected",
    liveEnabled: false,
  },
  {
    sourceClass: "spotify_embed_oembed",
    credential: null,
    readiness: "no_key_expected",
    liveEnabled: false,
  },
  {
    sourceClass: "public_company_government_feeds",
    credential: null,
    readiness: "no_key_expected_when_permitted",
    liveEnabled: false,
  },
  {
    sourceClass: "new_york_times_developer_api",
    credential: "NYT_API_KEY",
    readiness: "key_and_terms_review_required",
    liveEnabled: false,
  },
  {
    sourceClass: "spotify_web_api",
    credential: "SPOTIFY_CLIENT_ID,SPOTIFY_CLIENT_SECRET",
    readiness: "oauth_and_terms_review_required",
    liveEnabled: false,
  },
  {
    sourceClass: "premium_financial_news",
    credential: null,
    readiness: "commercial_agreement_required",
    liveEnabled: false,
  },
  {
    sourceClass: "licensed_full_text",
    credential: null,
    readiness: "commercial_agreement_required",
    liveEnabled: false,
  },
  {
    sourceClass: "real_time_market_data",
    credential: null,
    readiness: "commercial_agreement_required",
    liveEnabled: false,
  },
  {
    sourceClass: "commercial_transcripts",
    credential: null,
    readiness: "commercial_agreement_required",
    liveEnabled: false,
  },
] as const;

export const sourceOnboardingGate = [
  "source_identified",
  "official_documentation_reviewed",
  "terms_status_approved",
  "required_fields_and_limits_recorded",
  "cost_recorded",
  "credential_type_recorded",
  "adapter_dry_run_passed",
  "secret_stored_outside_git",
  "bounded_live_smoke_test_authorized",
  "reconciliation_reviewed",
  "source_explicitly_enabled",
] as const;
