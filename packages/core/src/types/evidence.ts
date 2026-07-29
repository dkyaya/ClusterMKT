import type { ArticleSource } from "../schemas/source";
import type { PodcastSource } from "../schemas/podcast";

export type ClusterEvidenceSource = ArticleSource | PodcastSource;

export interface EvidenceTrace {
  claimId: string;
  sourceIds: readonly string[];
  note: string;
}
