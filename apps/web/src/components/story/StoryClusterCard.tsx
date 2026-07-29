import type { StoryCluster } from "@cluster-mkt/core";
import { Badge, Surface } from "@cluster-mkt/ui";
import { Link } from "react-router-dom";

export function StoryClusterCard({ cluster }: { cluster: StoryCluster }) {
  return (
    <Surface as="article" className="cluster-card">
      <div className="card-meta">
        <Badge tone="accent">{cluster.relevance} relevance</Badge>
        <span>
          {cluster.sourceCount} sources · {cluster.primarySourceCount} primary
        </span>
      </div>
      <h2>
        <Link to={`/clusters/${cluster.id}?tab=overview`}>{cluster.title}</Link>
      </h2>
      <p>{cluster.shortOverview}</p>
      <p>
        <strong>Why it matters:</strong> {cluster.whyItMatters}
      </p>
      <div className="cluster-links">
        <Link to={`/clusters/${cluster.id}?tab=overview`}>Overview</Link>
        <Link to={`/clusters/${cluster.id}?tab=read`}>Read</Link>
        <Link to={`/clusters/${cluster.id}?tab=listen`}>Listen</Link>
      </div>
    </Surface>
  );
}
