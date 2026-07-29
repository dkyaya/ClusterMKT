import { Badge, Surface } from "@cluster-mkt/ui";
import { demoNormalization } from "../../data/demoNormalization";

export function NormalizedSourceRecordCard() {
  const { normalized, urlDecision } = demoNormalization;
  return (
    <Surface className="normalization-card" aria-labelledby="normalized-record-heading">
      <div className="normalization-card__heading">
        <div>
          <p className="eyebrow">Derived output</p>
          <h2 id="normalized-record-heading">Normalized source record</h2>
        </div>
        <Badge tone="accent">{normalized.reviewStatus}</Badge>
      </div>
      <dl className="normalization-fields">
        <div>
          <dt>Normalized ID</dt>
          <dd>{normalized.id}</dd>
        </div>
        <div>
          <dt>Source family</dt>
          <dd>{normalized.sourceFamily}</dd>
        </div>
        <div>
          <dt>Duplicate</dt>
          <dd>{normalized.duplicateStatus}</dd>
        </div>
        <div>
          <dt>Syndication</dt>
          <dd>{normalized.syndicationStatus}</dd>
        </div>
        <div>
          <dt>Article version</dt>
          <dd>{normalized.versionStatus}</dd>
        </div>
        <div>
          <dt>Underlying work</dt>
          <dd>{normalized.underlyingWork}</dd>
        </div>
      </dl>
      <p className="normalization-code">{normalized.canonicalUrl}</p>
      <div className="url-decision-grid">
        <section>
          <h3>Removed</h3>
          <p>{urlDecision.removed.join(" · ")}</p>
        </section>
        <section>
          <h3>Preserved</h3>
          <p>{urlDecision.preserved.join(" · ")}</p>
        </section>
      </div>
      <p className="normalization-provenance">Provenance: {normalized.provenance}</p>
    </Surface>
  );
}
