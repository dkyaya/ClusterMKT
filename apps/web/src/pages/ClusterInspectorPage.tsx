import { Badge } from "@cluster-mkt/ui";
import { AgreementGroupCard } from "../components/dev/AgreementGroupCard";
import { ClaimCard } from "../components/dev/ClaimCard";
import { ClusterCandidateCard } from "../components/dev/ClusterCandidateCard";
import { ClusterMembershipTable } from "../components/dev/ClusterMembershipTable";
import { DisagreementGroupCard } from "../components/dev/DisagreementGroupCard";
import { ProvenancePath } from "../components/dev/ProvenancePath";
import { ReviewRoutingCard } from "../components/dev/ReviewRoutingCard";
import { UncertaintyCard } from "../components/dev/UncertaintyCard";
import { PageContainer } from "../components/layout/PageContainer";
import { demoClusterInspection } from "../data/demoClusterInspection";

export function ClusterInspectorPage() {
  return (
    <PageContainer>
      <header className="page-intro cluster-inspector-intro">
        <div className="normalization-labels">
          <Badge tone="caution">Developer fixture inspector</Badge>
          <Badge>Offline demonstration data</Badge>
        </div>
        <p className="eyebrow">Direct URL only · not a consumer feature</p>
        <h1>Story Cluster and claim provenance inspector</h1>
        <p>
          Inspect deterministic membership, evidence-depth limits, support counting, discourse,
          uncertainty, review routing, and raw-source provenance. No publisher or model is
          contacted.
        </p>
        <p className="rules-version">
          Rules version <strong>{demoClusterInspection.rulesVersion}</strong>
        </p>
      </header>
      <ClusterCandidateCard />
      <ClusterMembershipTable />
      <ClaimCard />
      <div className="discourse-inspector-grid">
        <AgreementGroupCard />
        <DisagreementGroupCard />
      </div>
      <UncertaintyCard />
      <ReviewRoutingCard />
      <ProvenancePath />
    </PageContainer>
  );
}
