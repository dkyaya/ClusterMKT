import { Badge, Surface } from "@cluster-mkt/ui";
import { demoIngestionInspection as demo } from "../../data/demoIngestionInspection";
export function CheckpointCard() {
  return (
    <Surface className="ingestion-section">
      <h2>Checkpoints and resume</h2>
      <ul className="checkpoint-list">
        {demo.checkpoints.map((checkpoint) => (
          <li key={checkpoint}>
            <Badge tone="accent">complete</Badge>
            {checkpoint}
          </li>
        ))}
      </ul>
      <article className="resume-card">
        <h3>Interrupted and resumed run</h3>
        <p>
          <strong>Interrupted:</strong> {demo.resume.interruption}
        </p>
        <p>
          <strong>Preserved:</strong> {demo.resume.preserved}
        </p>
        <p>
          <strong>Result:</strong> {demo.resume.result}
        </p>
        <code>Resume token {demo.resume.token}</code>
      </article>
    </Surface>
  );
}
