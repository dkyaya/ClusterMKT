import { Surface } from "@cluster-mkt/ui";
import { demoIngestionInspection as demo } from "../../data/demoIngestionInspection";
export function RetrievalAttemptTable() {
  return (
    <Surface className="ingestion-section">
      <h2>Retrieval provenance</h2>
      <p>
        Every mock retrieval records a fixture path, cursor, checkpoint, adapter version, rules
        versions, and checksums without credentials.
      </p>
      <div className="ingestion-table" role="table" aria-label="Retrieval attempts">
        {demo.retrievals.map((item) => (
          <div className="ingestion-table-row" role="row" key={item.attempt}>
            <div role="cell">
              <strong>{item.attempt}</strong>
              <small>{item.source}</small>
            </div>
            <div role="cell">
              <span>{item.cursor}</span>
              <small>Checkpoint {item.checkpoint}</small>
            </div>
            <div role="cell">
              <code>{item.provenance}</code>
              <small>{item.result}</small>
            </div>
          </div>
        ))}
      </div>
    </Surface>
  );
}
