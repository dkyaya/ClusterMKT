import type { Claim } from "../schemas/claim";
import type { DisagreementType } from "../schemas/disagreement-group";
import { compareClaims } from "./claim-equivalence";

export function classifyDisagreement(
  left: Claim,
  right: Claim,
): {
  type: DisagreementType;
  reconcilable: boolean;
  explanationCodes: string[];
} {
  if (
    left.claimType === "causal_interpretation" &&
    right.claimType === "causal_interpretation" &&
    left.normalizedProposition !== right.normalizedProposition
  ) {
    return {
      type: "causal",
      reconcilable: false,
      explanationCodes: ["CAUSAL_EXPLANATIONS_DIFFER"],
    };
  }
  if (
    left.certaintyLanguage === "forecast" &&
    right.certaintyLanguage === "forecast" &&
    left.normalizedProposition !== right.normalizedProposition
  ) {
    return {
      type: "forecast",
      reconcilable: false,
      explanationCodes: ["FORECASTS_DIFFER"],
    };
  }
  const relation = compareClaims(left, right);
  if (["exactly_equivalent", "substantively_equivalent"].includes(relation.relationship)) {
    return {
      type: "apparent_only",
      reconcilable: true,
      explanationCodes: ["NO_SUBSTANTIVE_DISAGREEMENT"],
    };
  }
  if (relation.relationship === "quantitatively_conflicting") {
    return {
      type: "quantitative",
      reconcilable: false,
      explanationCodes: relation.explanationCodes,
    };
  }
  if (relation.relationship === "temporally_updated") {
    return { type: "temporal", reconcilable: true, explanationCodes: relation.explanationCodes };
  }
  if (relation.relationship === "interpretively_different") {
    return {
      type: "interpretive",
      reconcilable: false,
      explanationCodes: relation.explanationCodes,
    };
  }
  if (relation.relationship === "unrelated") {
    return {
      type: "apparent_only",
      reconcilable: true,
      explanationCodes: ["DIFFERENT_SUBJECT_OR_PREDICATE"],
    };
  }
  if (left.geography !== right.geography) {
    return { type: "scope", reconcilable: true, explanationCodes: ["GEOGRAPHY_DIFFERS"] };
  }
  return {
    type: "factual",
    reconcilable: false,
    explanationCodes: ["FACTUAL_PROPOSITIONS_CONFLICT"],
  };
}
