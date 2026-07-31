import { Badge, Surface } from "@cluster-mkt/ui";
import { demoReviewerWorkflow as demo } from "../../data/demoReviewerWorkflow";
export function AdjudicationPanel() {
  return (
    <Surface as="section" className="reviewer-card">
      <div className="reviewer-heading">
        <h2>Adjudication comparison</h2>
        <Badge tone="caution">Blocked safely</Badge>
      </div>
      <div className="adjudication-grid">
        <article>
          <h3>Reviewer Cedar</h3>
          <p>{demo.adjudication.reviewerA}</p>
        </article>
        <article>
          <h3>Reviewer Lake</h3>
          <p>{demo.adjudication.reviewerB}</p>
        </article>
        <article>
          <h3>Final label</h3>
          <p>{demo.adjudication.finalLabel}</p>
        </article>
      </div>
      <p className="reviewer-boundary-note">
        {demo.adjudication.reason} Critical provenance and factual labels are not decided by simple
        majority.
      </p>
    </Surface>
  );
}
