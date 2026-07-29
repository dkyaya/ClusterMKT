export interface PipelineCluster {
  id: string;
  reviewStatus: "accepted" | "review_required" | "rejected" | "quarantined";
  eligibleForDisplay: boolean;
}
export function processClustering(clusters: readonly PipelineCluster[]) {
  return {
    accepted: clusters.filter(
      (cluster) => cluster.reviewStatus === "accepted" && cluster.eligibleForDisplay,
    ),
    reviewRequired: clusters.filter((cluster) => cluster.reviewStatus === "review_required"),
    rejected: clusters.filter((cluster) => cluster.reviewStatus === "rejected"),
    quarantined: clusters.filter((cluster) => cluster.reviewStatus === "quarantined"),
  };
}
