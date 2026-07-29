import type { EntityMention } from "../schemas/entity-mention";
import type { EntityAliasRule } from "../types/normalization";

export interface EntityResolutionInput {
  headline: string;
  abstract?: string;
  text?: string;
  url?: string;
  sourceTags?: readonly string[];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findAlias(
  value: string,
  alias: string,
  caseSensitive: boolean,
): { start: number; end: number } | undefined {
  const expression = new RegExp(
    `(?<![\\p{L}\\p{N}])${escapeRegExp(alias)}(?![\\p{L}\\p{N}])`,
    caseSensitive ? "u" : "iu",
  );
  const match = expression.exec(value);
  return match ? { start: match.index, end: match.index + match[0].length } : undefined;
}

export function generateEntityCandidates(
  input: EntityResolutionInput,
  rules: readonly EntityAliasRule[],
): EntityMention[] {
  const fields: Array<[EntityMention["field"], string]> = [["headline", input.headline]];
  if (input.abstract) fields.push(["abstract", input.abstract]);
  if (input.text) fields.push(["text", input.text]);
  if (input.url) fields.push(["url", input.url]);
  if (input.sourceTags?.length) fields.push(["source_tag", input.sourceTags.join(" ")]);
  const candidates: EntityMention[] = [];
  const seen = new Set<string>();
  for (const rule of rules) {
    const aliasGroups: Array<[readonly string[], EntityMention["mentionType"], boolean]> = [
      [
        [rule.canonicalName, ...rule.exactAliases],
        rule.entityType === "sector" || rule.entityType === "subindustry"
          ? "sector_mention"
          : rule.entityType === "macro_topic"
            ? "macro_topic_mention"
            : rule.entityType === "government_agency" || rule.entityType === "economic_indicator"
              ? "institution_mention"
              : "direct_explicit_mention",
        false,
      ],
      [rule.caseSensitiveAliases, "direct_explicit_mention", true],
      [rule.tickerAliases, "ticker_mention", true],
      [rule.productAliases, "product_mention", false],
      [rule.subsidiaryAliases, "subsidiary_mention", false],
      [rule.executiveAliases, "executive_mention", false],
    ];
    for (const [aliases, mentionType, caseSensitive] of aliasGroups) {
      for (const alias of new Set(aliases)) {
        for (const [field, value] of fields) {
          const span = findAlias(value, alias, caseSensitive);
          if (!span) continue;
          const key = `${rule.entityId}:${field}:${span.start}:${mentionType}`;
          if (seen.has(key)) continue;
          seen.add(key);
          candidates.push({
            candidateEntityId: rule.entityId,
            entityType: rule.entityType,
            mentionType,
            matchedAlias: value.slice(span.start, span.end),
            field,
            start: span.start,
            end: span.end,
            direct: mentionType !== "inferred_relation",
            inferred: false,
            accepted: false,
            confidence: "low",
            explanationCodes: ["ENTITY_CANDIDATE_NOT_YET_ACCEPTED"],
            reviewStatus: "review_required",
            supportingRawFields: [field],
          });
        }
      }
    }
  }
  return candidates;
}
