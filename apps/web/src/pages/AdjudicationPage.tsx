import { Badge } from "@cluster-mkt/ui";
import { AdjudicationPanel } from "../components/dev/AdjudicationPanel";
import { AgreementMetricsCard } from "../components/dev/AgreementMetricsCard";
import { PageContainer } from "../components/layout/PageContainer";
export function AdjudicationPage() {
  return (
    <PageContainer>
      <header className="page-intro reviewer-intro">
        <div className="normalization-labels">
          <Badge tone="caution">Developer adjudication workbench</Badge>
          <Badge>Offline fixture state</Badge>
        </div>
        <p className="eyebrow">Direct URL only · no gold decision yet</p>
        <h1>Adjudication requires independent evidence review</h1>
        <p>
          Difficult cases remain visible and unresolved until qualified human decisions can be
          compared against the evidence and guidelines.
        </p>
      </header>
      <AdjudicationPanel />
      <AgreementMetricsCard />
    </PageContainer>
  );
}
