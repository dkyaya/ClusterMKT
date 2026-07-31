import { Badge, Surface } from "@cluster-mkt/ui";
import { Link } from "react-router-dom";
import { demoReviewerWorkflow as demo } from "../../data/demoReviewerWorkflow";

export function ReviewerTaskCard() {
  return (
    <Surface as="section" className="reviewer-card">
      <div className="reviewer-heading">
        <div>
          <p className="eyebrow">Next blinded assignment</p>
          <h2>{demo.sample.task}</h2>
        </div>
        <Badge tone="caution">{demo.sample.difficulty}</Badge>
      </div>
      <p>{demo.sample.headline}</p>
      <p>{demo.sample.instructions}</p>
      <div className="tag-row">
        <span>{demo.sample.id}</span>
        <span>{demo.sample.evidenceDepth}</span>
        <span>{demo.sample.partition}</span>
        <span>2–3 independent reviews</span>
      </div>
      <Link className="reviewer-primary-link" to={`/dev/review/${demo.sample.id}`}>
        Open blinded evidence package
      </Link>
    </Surface>
  );
}
