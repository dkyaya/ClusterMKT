export type ClusterStatus = "new" | "developing" | "established";

export function clusterStatus(firstDetectedAt: Date, lastUpdatedAt: Date): ClusterStatus {
  const age = lastUpdatedAt.getTime() - firstDetectedAt.getTime();
  if (age < 0) throw new RangeError("Last update cannot precede first detection.");
  if (age < 60 * 60 * 1000) return "new";
  if (age < 24 * 60 * 60 * 1000) return "developing";
  return "established";
}
