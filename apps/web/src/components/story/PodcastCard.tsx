import type { PodcastSource } from "@cluster-mkt/core";
import { Badge, Surface } from "@cluster-mkt/ui";

export function PodcastCard({ podcast }: { podcast: PodcastSource }) {
  return (
    <Surface as="article" className="source-card">
      <div className="card-meta">
        <Badge>
          {podcast.transcriptReviewed ? "Transcript reviewed" : "Transcript not reviewed"}
        </Badge>
        {podcast.relatedListeningOnly && <Badge tone="caution">Related listening only</Badge>}
        <Badge>{podcast.evidenceDepth}</Badge>
      </div>
      <p className="source-publisher">{podcast.publisher.name}</p>
      <h3>{podcast.episodeTitle}</h3>
      <p>
        <strong>Why this is included:</strong> {podcast.whyIncluded}
      </p>
      <p>
        {podcast.contributedEvidence
          ? "Contributed permitted transcript evidence"
          : "Did not contribute evidence to the overview"}
      </p>
      {podcast.url && (
        <a href={podcast.url} rel="noreferrer" target="_blank">
          Open podcast page <span aria-hidden="true">↗</span>
        </a>
      )}
    </Surface>
  );
}
