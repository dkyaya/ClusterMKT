import { Badge } from "@cluster-mkt/ui";
import { AgentAgreementMetrics } from "../components/dev/AgentAgreementMetrics";
import { AgentPanelSummary } from "../components/dev/AgentPanelSummary";
import { ReviewerIsolationStatus } from "../components/dev/ReviewerIsolationStatus";
import { PageContainer } from "../components/layout/PageContainer";
import { demoAgentPanelReview as demo } from "../data/demoAgentPanelReview";

export function AgentPanelDashboardPage() {
  return (
    <PageContainer>
      <header className="page-intro reviewer-intro">
        <div className="normalization-labels">
          <Badge tone="caution">Blind multi-agent calibration pilot</Badge>
          <Badge>Agents, not humans</Badge>
        </div>
        <p className="eyebrow">Direct URL only · absent from consumer navigation</p>
        <h1>Blinded agent reviewer panels</h1>
        <p>
          Isolated agent reviewers label evidence packets independently, with no visibility into
          pipeline predictions, existing gold labels, each other&rsquo;s decisions, or prior answers
          for the same item. Results are provisional and never described as independent human
          review.
        </p>
        <p className="rules-version">
          {demo.pilot.version} · {demo.pilot.labelFamily} · {demo.pilot.itemCount} pilot items
        </p>
      </header>
      <ReviewerIsolationStatus />
      <AgentAgreementMetrics />
      <AgentPanelSummary />
    </PageContainer>
  );
}
