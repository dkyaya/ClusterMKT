import type { EntityMention } from "../schemas/entity-mention";
import type { EntityAliasRule } from "../types/normalization";
import { normalizeComparisonText } from "./text-normalization";
import { disambiguateTicker } from "./ticker-disambiguation";

export function disambiguateEntityCandidate(
  candidate: EntityMention,
  context: string,
  rule: EntityAliasRule,
): EntityMention {
  if (candidate.field === "url" || candidate.field === "source_tag") {
    return {
      ...candidate,
      accepted: false,
      confidence: "low",
      reviewStatus: "review_required",
      explanationCodes: [
        "ENTITY_UNTRUSTED_FIELD_ONLY",
        "ENTITY_CANDIDATE_EXCLUDED_FROM_AUTOMATION",
      ],
    };
  }
  if (candidate.mentionType === "ticker_mention")
    return disambiguateTicker(candidate, context, rule);
  const normalized = normalizeComparisonText(context);
  const requiredContextPresent = rule.requiredCooccurringTerms.some((term) =>
    normalized.includes(normalizeComparisonText(term)),
  );
  const forbidden = [...rule.negativeContexts, ...rule.forbiddenContexts].some((term) =>
    normalized.includes(normalizeComparisonText(term)),
  );
  if (forbidden && !requiredContextPresent) {
    return {
      ...candidate,
      mentionType: "rejected_false_match",
      accepted: false,
      confidence: "high",
      reviewStatus: "rejected",
      explanationCodes: ["ENTITY_FORBIDDEN_CONTEXT"],
    };
  }
  if (candidate.field === "text" && !requiredContextPresent) {
    return {
      ...candidate,
      mentionType: "incidental_mention",
      accepted: false,
      confidence: "medium",
      reviewStatus: "review_required",
      explanationCodes: ["INCIDENTAL_MENTION_EXCLUDED"],
    };
  }
  if (
    ["product_mention", "subsidiary_mention", "executive_mention"].includes(candidate.mentionType)
  ) {
    const hasCompanyContext =
      normalized.includes(normalizeComparisonText(rule.canonicalName)) ||
      rule.requiredCooccurringTerms.some((term) =>
        normalized.includes(normalizeComparisonText(term)),
      );
    return {
      ...candidate,
      accepted: hasCompanyContext,
      confidence: hasCompanyContext ? "medium" : "low",
      reviewStatus: hasCompanyContext ? "accepted" : "review_required",
      explanationCodes: [
        hasCompanyContext ? "ENTITY_ALIAS_CONTEXT_CORROBORATED" : "ENTITY_ALIAS_AMBIGUOUS",
      ],
    };
  }
  const needsContext = rule.reviewRule !== "accept_explicit";
  const hasContext = !needsContext || requiredContextPresent;
  return {
    ...candidate,
    accepted: hasContext,
    confidence: hasContext ? "high" : "low",
    reviewStatus: hasContext ? "accepted" : "review_required",
    explanationCodes: [
      hasContext ? "ENTITY_EXPLICIT_CONTEXT_ACCEPTED" : "ENTITY_REQUIRED_CONTEXT_MISSING",
    ],
  };
}
