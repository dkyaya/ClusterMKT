import { Badge, Surface } from "@cluster-mkt/ui";
import { demoNormalization } from "../../data/demoNormalization";

export function DecisionTrace() {
  return (
    <Surface className="normalization-section" aria-labelledby="decision-trace-heading">
      <p className="eyebrow">Every stage is accountable</p>
      <h2 id="decision-trace-heading">Decision trace</h2>
      <ol className="decision-trace">
        {demoNormalization.trace.map(([stage, status, code]) => (
          <li key={stage}>
            <span>
              <strong>{stage}</strong>
              <code>{code}</code>
            </span>
            <Badge tone={status === "accepted" ? "accent" : "caution"}>{status}</Badge>
          </li>
        ))}
      </ol>
      <aside className="quarantine-notice" aria-label="Quarantined fixture example">
        <Badge tone="caution">{demoNormalization.quarantine.status}</Badge>
        <div>
          <strong>{demoNormalization.quarantine.id}</strong>
          <p>{demoNormalization.quarantine.reason}</p>
          <code>{demoNormalization.quarantine.code}</code>
        </div>
      </aside>
    </Surface>
  );
}
