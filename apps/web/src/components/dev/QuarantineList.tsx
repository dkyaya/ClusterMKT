import { Badge, Surface } from "@cluster-mkt/ui";
import { demoIngestionInspection as demo } from "../../data/demoIngestionInspection";
export function QuarantineList() {
  return (
    <Surface className="ingestion-section ingestion-quarantine">
      <h2>Quarantine and review isolation</h2>
      <div className="ingestion-grid">
        {demo.quarantine.map((item) => (
          <article className="ingestion-item" key={item.id}>
            <Badge tone="caution">{item.state}</Badge>
            <h3>{item.reason}</h3>
            <code>{item.id}</code>
            <p>{item.next}</p>
          </article>
        ))}
      </div>
    </Surface>
  );
}
