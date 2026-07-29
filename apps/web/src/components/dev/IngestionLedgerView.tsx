import { Surface } from "@cluster-mkt/ui";
import { demoIngestionInspection as demo } from "../../data/demoIngestionInspection";
export function IngestionLedgerView() {
  return (
    <Surface className="ingestion-section">
      <h2>Idempotency decisions and ledger</h2>
      <div className="ingestion-grid">
        {demo.idempotency.map((item) => (
          <article className="ingestion-item" key={item.item}>
            <h3>{item.item}</h3>
            <strong>{item.decision}</strong>
            <code>{item.code}</code>
          </article>
        ))}
      </div>
      <dl className="ingestion-counts">
        {Object.entries(demo.counts).map(([label, count]) => (
          <div key={label}>
            <dt>{label.replaceAll(/([A-Z])/g, " $1")}</dt>
            <dd>{count}</dd>
          </div>
        ))}
      </dl>
    </Surface>
  );
}
