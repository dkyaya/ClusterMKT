import { Badge, Surface } from "@cluster-mkt/ui";
import { demoAgentPanelReview as demo } from "../../data/demoAgentPanelReview";

export function ReviewerIsolationStatus() {
  const { isolation } = demo;
  return (
    <Surface as="section" className="reviewer-card">
      <div className="reviewer-heading">
        <h2>Worker isolation</h2>
        <Badge tone={isolation.hardToolSandbox ? "accent" : "caution"}>
          {isolation.hardToolSandbox ? "Hard sandbox" : "Content isolation"}
        </Badge>
      </div>
      <p className="eyebrow">{isolation.mechanism}</p>
      <div className="reviewer-metrics">
        <div>
          <dt>Saw pipeline prediction</dt>
          <dd>{String(isolation.sawPipelinePrediction)}</dd>
        </div>
        <div>
          <dt>Saw peer decisions</dt>
          <dd>{String(isolation.sawPeerDecisions)}</dd>
        </div>
        <div>
          <dt>Saw prior answer for item</dt>
          <dd>{String(isolation.sawPriorAnswerForItem)}</dd>
        </div>
        <div>
          <dt>Saw gold label</dt>
          <dd>{String(isolation.sawGoldLabel)}</dd>
        </div>
      </div>
      <p className="tag-row">
        {isolation.workerPseudonyms.map((id) => (
          <span key={id}>{id}</span>
        ))}
      </p>
      <p className="reviewer-boundary-note">{isolation.note}</p>
    </Surface>
  );
}
