import { Badge, Surface } from "@cluster-mkt/ui";
export function ReconciliationSummary() {
  return (
    <Surface className="ingestion-section ingestion-reconciliation">
      <div className="ingestion-heading">
        <div>
          <p className="eyebrow">Every raw record ends in one state</p>
          <h2>Reconciliation</h2>
        </div>
        <Badge tone="accent">PASS</Badge>
      </div>
      <p>
        5 received = 3 normalized + 1 review-required + 1 quarantined. Accepted output contains one
        Story Cluster and one reusable Sector Brief. Unexplained loss: 0.
      </p>
      <div className="boundary-status">
        <span>No live sources connected</span>
        <span>No credentials configured</span>
        <span>No real network calls</span>
      </div>
    </Surface>
  );
}
