import { Badge, Surface } from "@cluster-mkt/ui";
import { demoNormalization } from "../../data/demoNormalization";

export function RawSourceRecordCard() {
  const { raw } = demoNormalization;
  return (
    <Surface className="normalization-card" aria-labelledby="raw-record-heading">
      <div className="normalization-card__heading">
        <div>
          <p className="eyebrow">Untrusted input</p>
          <h2 id="raw-record-heading">Raw source record</h2>
        </div>
        <Badge tone="caution">Preserved</Badge>
      </div>
      <dl className="normalization-fields">
        <div>
          <dt>Raw ID</dt>
          <dd>{raw.id}</dd>
        </div>
        <div>
          <dt>Publisher claim</dt>
          <dd>{raw.publisher}</dd>
        </div>
        <div>
          <dt>Source role</dt>
          <dd>{raw.sourceRole}</dd>
        </div>
        <div>
          <dt>Evidence depth</dt>
          <dd>{raw.evidenceDepth}</dd>
        </div>
      </dl>
      <h3>{raw.headline}</h3>
      <p className="normalization-code">{raw.originalUrl}</p>
      <p className="normalization-provenance">Payload reference: {raw.payloadReference}</p>
    </Surface>
  );
}
