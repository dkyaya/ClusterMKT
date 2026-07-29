import { comparisonTokenValues } from "./tokenization";
import { normalizeComparisonText } from "./text-normalization";

export function tokenJaccardSimilarity(left: string, right: string): number {
  const leftSet = new Set(comparisonTokenValues(normalizeComparisonText(left)));
  const rightSet = new Set(comparisonTokenValues(normalizeComparisonText(right)));
  const union = new Set([...leftSet, ...rightSet]);
  if (union.size === 0) return 1;
  let intersection = 0;
  for (const token of leftSet) if (rightSet.has(token)) intersection += 1;
  return intersection / union.size;
}
