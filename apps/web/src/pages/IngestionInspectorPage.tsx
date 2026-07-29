import { Badge } from "@cluster-mkt/ui";
import { AdapterResultCard } from "../components/dev/AdapterResultCard";
import { CheckpointCard } from "../components/dev/CheckpointCard";
import { IngestionLedgerView } from "../components/dev/IngestionLedgerView";
import { IngestionRunCard } from "../components/dev/IngestionRunCard";
import { QuarantineList } from "../components/dev/QuarantineList";
import { ReconciliationSummary } from "../components/dev/ReconciliationSummary";
import { RetrievalAttemptTable } from "../components/dev/RetrievalAttemptTable";
import { RetryTimeline } from "../components/dev/RetryTimeline";
import { PageContainer } from "../components/layout/PageContainer";
import { demoIngestionInspection as demo } from "../data/demoIngestionInspection";
export function IngestionInspectorPage() {
  return (
    <PageContainer>
      <header className="page-intro ingestion-intro">
        <div className="normalization-labels">
          <Badge tone="caution">Developer fixture inspector</Badge>
          <Badge>Offline ingestion simulation</Badge>
        </div>
        <p className="eyebrow">Direct URL only · not a consumer feature</p>
        <h1>Offline ingestion dry-run inspector</h1>
        <p>
          Trace source selection through mock adapters, retrieval provenance, idempotency, bounded
          retry, quarantine, checkpoints, Story Clusters, Sector Briefs, and complete
          reconciliation.
        </p>
        <p className="rules-version">
          Rules: <strong>{demo.rules.registry}</strong> · {demo.rules.normalization} ·{" "}
          {demo.rules.ingestion}
        </p>
      </header>
      <ReconciliationSummary />
      <IngestionRunCard />
      <AdapterResultCard />
      <RetrievalAttemptTable />
      <RetryTimeline />
      <QuarantineList />
      <IngestionLedgerView />
      <CheckpointCard />
    </PageContainer>
  );
}
