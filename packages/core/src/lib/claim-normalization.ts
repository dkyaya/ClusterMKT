import { normalizeComparisonText } from "./text-normalization";

export function normalizeClaimProposition(value: string): string {
  return normalizeComparisonText(value)
    .replace(/\bapproximately\b|\broughly\b|\babout\b/gu, "approx")
    .replace(/\bone[- ]tenth\b/gu, "10 percent")
    .trim();
}
