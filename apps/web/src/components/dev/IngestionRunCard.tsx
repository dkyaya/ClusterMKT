import { Badge, Surface } from "@cluster-mkt/ui";
import { demoIngestionInspection as demo } from "../../data/demoIngestionInspection";
export function IngestionRunCard() {
  return (
    <Surface className="ingestion-card">
      <div className="ingestion-heading">
        <div>
          <p className="eyebrow">Scheduled edition fixture</p>
          <h2>Ingestion run</h2>
        </div>
        <Badge tone="caution">{demo.run.status}</Badge>
      </div>
      <dl className="ingestion-metrics">
        <div>
          <dt>Run</dt>
          <dd>{demo.run.id}</dd>
        </div>
        <div>
          <dt>Edition</dt>
          <dd>{demo.run.edition}</dd>
        </div>
        <div>
          <dt>Slot</dt>
          <dd>{demo.run.slot}</dd>
        </div>
        <div>
          <dt>Sources</dt>
          <dd>{demo.status.fixtureSourcesSelected}</dd>
        </div>
      </dl>
    </Surface>
  );
}
