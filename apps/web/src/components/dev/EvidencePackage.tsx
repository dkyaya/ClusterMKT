import { Badge, Surface } from "@cluster-mkt/ui";
import { demoReviewerWorkflow as demo } from "../../data/demoReviewerWorkflow";

export function EvidencePackage() {
  return (
    <Surface as="section" className="reviewer-card" aria-labelledby="evidence-package-heading">
      <div className="reviewer-heading">
        <h2 id="evidence-package-heading">Evidence package</h2>
        <Badge>{demo.sample.evidenceDepth}</Badge>
      </div>
      <p className="reviewer-evidence-label">Headline</p>
      <p>{demo.sample.headline}</p>
      <p className="reviewer-evidence-label">Fixture abstract</p>
      <p>{demo.sample.abstract}</p>
      <p className="reviewer-evidence-label">Permitted fixture excerpt</p>
      <blockquote>{demo.sample.excerpt}</blockquote>
      <p className="reviewer-evidence-label">Provenance</p>
      <ul>
        {demo.sample.provenance.map((value) => (
          <li key={value}>
            <code>{value}</code>
          </li>
        ))}
      </ul>
      <dl className="reviewer-evidence-meta">
        <div>
          <dt>Source category</dt>
          <dd>{demo.sample.sourceCategory}</dd>
        </div>
        <div>
          <dt>Fixture-use class</dt>
          <dd>{demo.sample.copyrightClassification}</dd>
        </div>
      </dl>
      <p className="reviewer-boundary-note">
        Label only this visible evidence. Pipeline predictions and peer labels remain hidden until
        initial submission.
      </p>
    </Surface>
  );
}
