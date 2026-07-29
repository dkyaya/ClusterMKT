import type { ArticleSource } from "@cluster-mkt/core";
import { Badge, Surface } from "@cluster-mkt/ui";
import { formatTime } from "../../lib/format";

export function SourceCard({ source }: { source: ArticleSource }) {
  return (
    <Surface as="article" className="source-card">
      <div className="card-meta">
        <Badge tone={source.evidenceRole === "primary" ? "accent" : "neutral"}>
          {source.evidenceRole} source
        </Badge>
        <Badge>{source.relevance} relevance</Badge>
      </div>
      <p className="source-publisher">{source.publisher.name}</p>
      <h3>{source.title}</h3>
      <p className="source-details">
        <time dateTime={source.publishedAt}>{formatTime(source.publishedAt)}</time> ·{" "}
        {source.accessType} access
      </p>
      <p>
        <strong>Why this is included:</strong> {source.whyIncluded}
      </p>
      <p>
        {source.usedInOverview
          ? "Used in the demonstration overview"
          : "Related reading; not used in the overview"}
      </p>
      {source.url && (
        <a href={source.url} rel="noreferrer" target="_blank">
          Open original demonstration source <span aria-hidden="true">↗</span>
        </a>
      )}
    </Surface>
  );
}
