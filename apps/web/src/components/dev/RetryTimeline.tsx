import { Badge, Surface } from "@cluster-mkt/ui";
import { demoIngestionInspection as demo } from "../../data/demoIngestionInspection";
export function RetryTimeline() {
  return (
    <Surface className="ingestion-section">
      <h2>Retry timeline and circuit breaker</h2>
      <ol className="ingestion-timeline">
        {demo.retries.map((retry) => (
          <li key={retry.attempt}>
            <Badge tone={retry.circuit === "open" ? "caution" : "neutral"}>
              Attempt {retry.attempt}
            </Badge>
            <div>
              <strong>{retry.event}</strong>
              <p>{retry.decision}</p>
              <code>Circuit: {retry.circuit}</code>
            </div>
          </li>
        ))}
      </ol>
    </Surface>
  );
}
