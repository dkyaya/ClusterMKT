import { Badge, Surface } from "@cluster-mkt/ui";
import { demoClusterInspection } from "../../data/demoClusterInspection";

export function ClusterCandidateCard() {
  const { candidate } = demoClusterInspection;
  return (
    <Surface as="section" className="cluster-inspector-card cluster-candidate-card">
      <div className="cluster-inspector-heading">
        <div>
          <p className="eyebrow">Candidate Story Cluster</p>
          <h2>{candidate.title}</h2>
        </div>
        <Badge tone="accent">{candidate.status}</Badge>
      </div>
      <dl className="cluster-inspector-metrics">
        <div>
          <dt>Scope</dt>
          <dd>{candidate.scope}</dd>
        </div>
        <div>
          <dt>Confidence</dt>
          <dd>{candidate.confidence}</dd>
        </div>
        <div>
          <dt>Raw sources</dt>
          <dd>{candidate.rawSources}</dd>
        </div>
        <div>
          <dt>Underlying works</dt>
          <dd>{candidate.underlyingWorks}</dd>
        </div>
        <div>
          <dt>Independent</dt>
          <dd>{candidate.independentSources}</dd>
        </div>
        <div>
          <dt>Primary</dt>
          <dd>{candidate.primarySources}</dd>
        </div>
      </dl>
      <code>{candidate.id}</code>
    </Surface>
  );
}
