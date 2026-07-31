import { Badge, Surface } from "@cluster-mkt/ui";
import { demoReviewerWorkflow as demo } from "../../data/demoReviewerWorkflow";
export function CorpusCoverageCard() {
  return (
    <Surface as="section" className="reviewer-card">
      <div className="reviewer-heading">
        <h2>Corpus coverage and partition</h2>
        <Badge>{demo.corpus.itemCount} items</Badge>
      </div>
      <div className="reviewer-coverage-grid">
        {demo.tasks.map(([name, count]) => (
          <div key={name}>
            <strong>{count}</strong>
            <span>{name}</span>
          </div>
        ))}
      </div>
      <h3>Adversarial strata</h3>
      <div className="tag-row">
        {demo.strata.map(([name, count]) => (
          <span key={name}>
            {name}: {count}
          </span>
        ))}
      </div>
      <h3>Leakage-safe partition</h3>
      <p>
        {demo.partition.training} · {demo.partition.calibration} · {demo.partition.heldOut} ·{" "}
        {demo.partition.leakage}
      </p>
      <p>
        Regression promotion: <strong>{demo.sample.regressionStatus}</strong>
      </p>
      <p className="reviewer-boundary-note">
        Partitioning is by event or underlying work, so article versions and syndicated copies
        cannot leak across splits.
      </p>
    </Surface>
  );
}
