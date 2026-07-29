import type { EntityMention } from "../schemas/entity-mention";
import type { EntityAliasRule } from "../types/normalization";
import { normalizeComparisonText } from "./text-normalization";

const defaultFinancialTerms = [
  "shares",
  "stock",
  "ticker",
  "nasdaq",
  "nyse",
  "earnings",
  "guidance",
  "revenue",
  "investors",
];

export function disambiguateTicker(
  candidate: EntityMention,
  context: string,
  rule: EntityAliasRule,
  financialTerms: readonly string[] = defaultFinancialTerms,
): EntityMention {
  const normalized = normalizeComparisonText(context);
  const requiredTerms = rule.requiredCooccurringTerms.map(normalizeComparisonText);
  const hasRequiredContext = requiredTerms.some((term) => normalized.includes(term));
  const hasFinancialContext = financialTerms.some((term) => normalized.includes(term));
  const forbidden = rule.forbiddenContexts.some((term) =>
    normalized.includes(normalizeComparisonText(term)),
  );
  if (!forbidden && (hasRequiredContext || hasFinancialContext)) {
    return {
      ...candidate,
      accepted: true,
      confidence: hasRequiredContext ? "high" : "medium",
      reviewStatus: "accepted",
      explanationCodes: [
        "TICKER_CASE_EXACT",
        hasRequiredContext ? "TICKER_REQUIRED_CONTEXT_PRESENT" : "TICKER_FINANCIAL_CONTEXT_PRESENT",
      ],
    };
  }
  return {
    ...candidate,
    mentionType: "rejected_false_match",
    accepted: false,
    confidence: "high",
    reviewStatus: "rejected",
    explanationCodes: [forbidden ? "TICKER_FORBIDDEN_CONTEXT" : "TICKER_CONTEXT_INSUFFICIENT"],
  };
}
