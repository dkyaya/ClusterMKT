import { Badge } from "@cluster-mkt/ui";
import { AgreementMetricsCard } from "../components/dev/AgreementMetricsCard";
import { CorpusCoverageCard } from "../components/dev/CorpusCoverageCard";
import { ReviewerTaskCard } from "../components/dev/ReviewerTaskCard";
import { PageContainer } from "../components/layout/PageContainer";
import { demoReviewerWorkflow as demo } from "../data/demoReviewerWorkflow";
export function ReviewerWorkbenchPage() {
  return (
    <PageContainer>
      <header className="page-intro reviewer-intro">
        <div className="normalization-labels">
          <Badge tone="caution">Developer reviewer workbench</Badge>
          <Badge>Offline fixture corpus</Badge>
        </div>
        <p className="eyebrow">Direct URL only · no authentication claim</p>
        <h1>Blinded gold-corpus review</h1>
        <p>
          Reviewers label visible fixture evidence independently. System predictions, peer
          decisions, and adjudication outcomes remain hidden until initial submission.
        </p>
        <p className="rules-version">
          {demo.corpus.version} · {demo.corpus.automatedLabels} automated labels · no live
          publishers
        </p>
      </header>
      <div className="reviewer-status-strip">
        <strong>{demo.corpus.status}</strong>
        <span>Gold labels: {demo.corpus.goldLabels}</span>
        <span>Threshold changes: {demo.calibration.thresholdChanges}</span>
      </div>
      <ReviewerTaskCard />
      <CorpusCoverageCard />
      <AgreementMetricsCard />
    </PageContainer>
  );
}
