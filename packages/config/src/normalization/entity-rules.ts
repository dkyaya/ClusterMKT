export const entityResolutionRules = {
  tickerContextWindowTokens: 8,
  financialContextTerms: [
    "shares",
    "stock",
    "ticker",
    "nasdaq",
    "nyse",
    "earnings",
    "guidance",
    "revenue",
    "investors",
  ],
  untrustedFields: ["url", "source_tag"],
  autoAcceptFields: ["headline", "abstract", "text"],
  rulesVersion: "normalization-v1",
} as const;
