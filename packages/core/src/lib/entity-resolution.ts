import type { EntityResolutionDecision } from "../schemas/entity-resolution-decision";
import type { EntityAliasRule } from "../types/normalization";
import {
  generateEntityCandidates,
  type EntityResolutionInput,
} from "./entity-candidate-generation";
import { disambiguateEntityCandidate } from "./entity-disambiguation";

export function resolveEntities(
  rawRecordId: string,
  input: EntityResolutionInput,
  rules: readonly EntityAliasRule[],
  rulesVersion: string,
): EntityResolutionDecision {
  const context = [input.headline, input.abstract, input.text].filter(Boolean).join(" ");
  const ruleByEntity = new Map(rules.map((rule) => [rule.entityId, rule]));
  const candidates = generateEntityCandidates(input, rules).map((candidate) => {
    const rule = ruleByEntity.get(candidate.candidateEntityId);
    return rule ? disambiguateEntityCandidate(candidate, context, rule) : candidate;
  });
  const acceptedEntityIds = [
    ...new Set(candidates.filter((item) => item.accepted).map((item) => item.candidateEntityId)),
  ];
  const rejectedEntityIds = [
    ...new Set(
      candidates
        .filter((item) => item.reviewStatus === "rejected")
        .map((item) => item.candidateEntityId),
    ),
  ];
  const reviewRequiredEntityIds = [
    ...new Set(
      candidates
        .filter((item) => item.reviewStatus === "review_required")
        .map((item) => item.candidateEntityId),
    ),
  ];
  return {
    rawRecordId,
    candidates,
    acceptedEntityIds,
    rejectedEntityIds,
    reviewRequiredEntityIds,
    rulesVersion,
  };
}
