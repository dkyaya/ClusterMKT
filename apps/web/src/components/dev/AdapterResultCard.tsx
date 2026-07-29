import { Badge, Surface } from "@cluster-mkt/ui";
import { demoIngestionInspection as demo } from "../../data/demoIngestionInspection";
export function AdapterResultCard() {
  return (
    <Surface className="ingestion-section">
      <h2>Source selection and adapter results</h2>
      <div className="ingestion-grid">
        {demo.adapters.map((adapter) => (
          <article key={adapter.id} className="ingestion-item">
            <Badge tone={adapter.status === "accepted" ? "accent" : "caution"}>
              {adapter.status}
            </Badge>
            <h3>{adapter.id}</h3>
            <p>{adapter.source}</p>
            <strong>{adapter.records} raw records</strong>
          </article>
        ))}
      </div>
    </Surface>
  );
}
