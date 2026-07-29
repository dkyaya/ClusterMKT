import type { RelevanceLabel } from "../schemas/source";

export function relevanceLabelForScore(score: number): RelevanceLabel {
  if (!Number.isFinite(score) || score < 0 || score > 1) {
    throw new RangeError("Relevance score must be between 0 and 1.");
  }
  if (score >= 0.75) return "high";
  if (score >= 0.45) return "moderate";
  return "context";
}
