import { Badge, Surface } from "@cluster-mkt/ui";
import { demoReviewerWorkflow as demo } from "../../data/demoReviewerWorkflow";
export function AgreementMetricsCard() {
  return (
    <Surface as="section" className="reviewer-card">
      <div className="reviewer-heading">
        <h2>Inter-rater agreement</h2>
        <Badge tone="caution">Pending</Badge>
      </div>
      <dl className="reviewer-metrics">
        <div>
          <dt>Raw agreement</dt>
          <dd>Not measurable</dd>
        </div>
        <div>
          <dt>Cohen’s kappa</dt>
          <dd>Not measurable</dd>
        </div>
        <div>
          <dt>Fabricated values</dt>
          <dd>{demo.agreement.fabricated}</dd>
        </div>
        <div>
          <dt>Gate</dt>
          <dd>2+ human reviews</dd>
        </div>
      </dl>
      <p>
        Metrics are reported by task, label, difficulty, evidence depth, sector, source category,
        and reviewer pair only after valid submissions exist.
      </p>
    </Surface>
  );
}
