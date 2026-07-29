import type { Claim } from "../schemas/claim";
import { normalizeClaimProposition } from "./claim-normalization";
import { comparedClaimFields } from "./claim-similarity";

export type ClaimRelationship =
  | "exactly_equivalent"
  | "substantively_equivalent"
  | "compatible_but_not_equivalent"
  | "temporally_updated"
  | "quantitatively_conflicting"
  | "factually_conflicting"
  | "interpretively_different"
  | "unrelated";

export function compareClaims(
  left: Claim,
  right: Claim,
): {
  relationship: ClaimRelationship;
  explanationCodes: string[];
  comparedFields: ReturnType<typeof comparedClaimFields>;
  confidence: "high" | "medium" | "low";
  reviewStatus: "accepted" | "review_required";
} {
  const comparedFields = comparedClaimFields(left, right);
  const sameSubject = comparedFields.same.includes("subjectEntityIds");
  if (!sameSubject || left.predicate !== right.predicate) {
    return {
      relationship: "unrelated",
      explanationCodes: ["SUBJECT_OR_PREDICATE_DIFFERS"],
      comparedFields,
      confidence: "high",
      reviewStatus: "accepted",
    };
  }
  const leftValue = left.quantitativeValues[0]?.numericValue;
  const rightValue = right.quantitativeValues[0]?.numericValue;
  if (leftValue !== undefined && rightValue !== undefined) {
    const denominator = Math.max(Math.abs(leftValue), Math.abs(rightValue), 1);
    const difference = Math.abs(leftValue - rightValue) / denominator;
    if (difference <= 0.02) {
      return {
        relationship: "substantively_equivalent",
        explanationCodes: ["QUANTITATIVE_ROUNDING_COMPATIBLE"],
        comparedFields,
        confidence: "high",
        reviewStatus: "accepted",
      };
    }
    return {
      relationship: "quantitatively_conflicting",
      explanationCodes: ["INCOMPATIBLE_QUANTITATIVE_VALUES"],
      comparedFields,
      confidence: "high",
      reviewStatus: "accepted",
    };
  }
  if (left.timeScope && right.timeScope && left.timeScope !== right.timeScope) {
    return {
      relationship: "temporally_updated",
      explanationCodes: ["TIME_SCOPE_DIFFERS"],
      comparedFields,
      confidence: "medium",
      reviewStatus: "review_required",
    };
  }
  const leftNormalized = normalizeClaimProposition(left.normalizedProposition);
  const rightNormalized = normalizeClaimProposition(right.normalizedProposition);
  if (leftNormalized === rightNormalized) {
    return {
      relationship: "exactly_equivalent",
      explanationCodes: ["NORMALIZED_PROPOSITION_MATCH"],
      comparedFields,
      confidence: "high",
      reviewStatus: "accepted",
    };
  }
  if ([left.claimType, right.claimType].some((type) => type.includes("interpretation"))) {
    return {
      relationship: "interpretively_different",
      explanationCodes: ["INTERPRETATION_DIFFERS"],
      comparedFields,
      confidence: "medium",
      reviewStatus: "accepted",
    };
  }
  if (left.direction && right.direction && left.direction !== right.direction) {
    return {
      relationship: "factually_conflicting",
      explanationCodes: ["DIRECTION_CONFLICT"],
      comparedFields,
      confidence: "high",
      reviewStatus: "accepted",
    };
  }
  return {
    relationship: "compatible_but_not_equivalent",
    explanationCodes: ["COMPATIBLE_SCOPE_DIFFERENCE"],
    comparedFields,
    confidence: "medium",
    reviewStatus: "review_required",
  };
}
