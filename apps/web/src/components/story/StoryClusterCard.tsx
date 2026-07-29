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
        <Link to={`/clusters/${cluster.id}`}>{cluster.title}</Link>
      </h2>
      <p>{cluster.shortOverview}</p>
      <p>
        <strong>Why it matters:</strong> {cluster.whyItMatters}
      </p>
      <div className="cluster-links">
        <Link to={`/clusters/${cluster.id}`}>Overview</Link>
        <Link to={`/clusters/${cluster.id}`}>Read</Link>
        <Link to={`/clusters/${cluster.id}`}>Listen</Link>
      </div>
    </Surface>
  );
}
