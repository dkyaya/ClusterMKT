import type { RawSourceRecord } from "../schemas/raw-source-record";

export interface ArticleChangeSet {
  changedFields: string[];
  materialChange: boolean;
}

export function detectArticleChanges(
  previous: RawSourceRecord,
  next: RawSourceRecord,
): ArticleChangeSet {
  const changedFields: string[] = [];
  for (const field of [
    "headline",
    "subtitle",
    "publisherAbstract",
    "contentChecksum",
    "metadataChecksum",
  ] as const) {
    if (previous[field] !== next[field]) changedFields.push(field);
  }
  const materialChange =
    changedFields.includes("contentChecksum") ||
    changedFields.includes("publisherAbstract") ||
    /correction|corrected|revised/i.test(next.headline);
  return { changedFields, materialChange };
}
