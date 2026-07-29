import type { RawSourceRecord } from "../schemas/raw-source-record";
import { tokenJaccardSimilarity } from "./duplicate-scoring";

export type DuplicateRelationship = "exact_duplicate" | "near_duplicate" | "distinct";

export interface DuplicateDecision {
  relationship: DuplicateRelationship;
  explanationCodes: string[];
  score: number;
}

export function detectDuplicate(left: RawSourceRecord, right: RawSourceRecord): DuplicateDecision {
  if (left.rawRecordId === right.rawRecordId) {
    return { relationship: "exact_duplicate", explanationCodes: ["DUPLICATE_RAW_ID"], score: 1 };
  }
  if (
    left.sourceProvidedArticleId &&
    left.sourceProvidedArticleId === right.sourceProvidedArticleId &&
    left.sourceRegistryId === right.sourceRegistryId
  ) {
    return {
      relationship: "exact_duplicate",
      explanationCodes: ["DUPLICATE_SOURCE_ARTICLE_ID"],
      score: 1,
    };
  }
  if (left.contentChecksum && left.contentChecksum === right.contentChecksum) {
    return {
      relationship: "exact_duplicate",
      explanationCodes: ["DUPLICATE_CONTENT_CHECKSUM"],
      score: 1,
    };
  }
  if (
    left.feedEntryId &&
    left.feedEntryId === right.feedEntryId &&
    left.sourceRegistryId === right.sourceRegistryId
  ) {
    return {
      relationship: "exact_duplicate",
      explanationCodes: ["DUPLICATE_FEED_ENTRY"],
      score: 1,
    };
  }
  const score = tokenJaccardSimilarity(left.headline, right.headline);
  return score >= 0.92
    ? { relationship: "near_duplicate", explanationCodes: ["NEAR_DUPLICATE_HEADLINE"], score }
    : { relationship: "distinct", explanationCodes: ["DISTINCT_METADATA"], score };
}
