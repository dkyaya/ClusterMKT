import { Badge, Surface } from "@cluster-mkt/ui";
import { demoAgentPanelReview as demo } from "../../data/demoAgentPanelReview";

export function AgentAgreementMetrics() {
  const { pilot } = demo;
  return (
    <Surface as="section" className="reviewer-card">
      <div className="reviewer-heading">
        <h2>Pilot-wide agreement</h2>
        <Badge tone="caution">Provisional · not human inter-rater agreement</Badge>
      </div>
      <div className="reviewer-metrics">
        <div>
          <dt>Pilot items</dt>
          <dd>{pilot.itemCount}</dd>
        </div>
        <div>
          <dt>Reviewer decision target</dt>
          <dd>{pilot.reviewerDecisionTarget}</dd>
        </div>
        <div>
          <dt>Repeat-stability items</dt>
          <dd>{pilot.repeatStabilityItemCount}</dd>
        </div>
        <div>
          <dt>Label family</dt>
          <dd>{pilot.labelFamily}</dd>
        </div>
      </div>
      <p className="reviewer-status-strip">
        <strong>{pilot.status}</strong>
      </p>
      <p className="reviewer-boundary-note">{pilot.disclaimer}</p>
    </Surface>
  );
}
