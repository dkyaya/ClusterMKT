import { Badge } from "@cluster-mkt/ui";
import { DecisionTrace } from "../components/dev/DecisionTrace";
import { EntityDecisionList } from "../components/dev/EntityDecisionList";
import { EventSignatureCard } from "../components/dev/EventSignatureCard";
import { NormalizedSourceRecordCard } from "../components/dev/NormalizedSourceRecordCard";
import { RawSourceRecordCard } from "../components/dev/RawSourceRecordCard";
import { PageContainer } from "../components/layout/PageContainer";
import { demoNormalization } from "../data/demoNormalization";

export function NormalizationInspectorPage() {
  return (
    <PageContainer>
      <header className="page-intro normalization-intro">
        <div className="normalization-labels">
          <Badge tone="caution">Developer fixture inspector</Badge>
          <Badge tone="neutral">Offline demonstration data</Badge>
        </div>
        <p className="eyebrow">Direct URL only · not a consumer feature</p>
        <h1>Normalization decision inspector</h1>
        <p>
          Trace one preserved raw fixture through safe URL cleanup, duplicate and version checks,
          contextual entity resolution, event boundaries, and review routing. No publisher is
          contacted.
        </p>
        <p className="rules-version">
          Rules version <strong>{demoNormalization.rulesVersion}</strong>
        </p>
      </header>
      <section className="normalization-comparison" aria-label="Raw and normalized records">
        <RawSourceRecordCard />
        <NormalizedSourceRecordCard />
      </section>
      <EntityDecisionList />
      <EventSignatureCard />
      <DecisionTrace />
    </PageContainer>
  );
}
