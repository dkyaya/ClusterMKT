import type { EventSignature } from "../schemas/event-signature";

export interface ClusterSimilarityResult {
  compatible: boolean;
  supportingFields: string[];
  conflictingFields: string[];
  explanationCodes: string[];
}

const overlaps = (left: string[], right: string[]) => left.some((value) => right.includes(value));

export function compareClusterEvents(
  seed: EventSignature,
  candidate: EventSignature,
): ClusterSimilarityResult {
  const supportingFields: string[] = [];
  const conflictingFields: string[] = [];
  const explanationCodes: string[] = [];
  if (seed.eventSignatureId === candidate.eventSignatureId) {
    supportingFields.push("eventSignatureId");
    explanationCodes.push("same_event_signature");
  }
  if (overlaps(seed.primaryEntityIds, candidate.primaryEntityIds)) {
    supportingFields.push("primaryEntityIds");
  } else {
    conflictingFields.push("primaryEntityIds");
  }
  if (seed.eventType === candidate.eventType) supportingFields.push("eventType");
  else if (candidate.eventType === "market_reaction")
    explanationCodes.push("market_reaction_to_event");
  else {
    conflictingFields.push("eventType");
    explanationCodes.push("different_event_type");
  }
  for (const [field, code] of [
    ["policyOrFilingId", "same_policy_identifier"],
    ["effectiveDate", "same_effective_date"],
    ["geography", "same_geography"],
    ["productOrBusinessLine", "same_product_line"],
  ] as const) {
    const left = seed[field];
    const right = candidate[field];
    if (left && right && left === right) {
      supportingFields.push(field);
      explanationCodes.push(code);
    } else if (left && right && left !== right) {
      conflictingFields.push(field);
      explanationCodes.push(
        field === "effectiveDate"
          ? "different_effective_period"
          : field === "geography"
            ? "different_geography"
            : field === "productOrBusinessLine"
              ? "different_product_line"
              : "different_policy_identifier",
      );
    }
  }
  if (overlaps(seed.quantitativeAnchors, candidate.quantitativeAnchors)) {
    supportingFields.push("quantitativeAnchors");
    explanationCodes.push("same_quantitative_anchor");
  }
  const hardConflict = conflictingFields.some((field) =>
    ["eventType", "policyOrFilingId", "effectiveDate", "productOrBusinessLine"].includes(field),
  );
  const compatible = !hardConflict && supportingFields.length >= 2;
  if (!compatible && supportingFields.length === 1 && supportingFields[0] === "primaryEntityIds") {
    explanationCodes.push("same_entity_only");
  }
  return { compatible, supportingFields, conflictingFields, explanationCodes };
}
