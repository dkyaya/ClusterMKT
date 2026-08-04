import { Badge } from "@cluster-mkt/ui";
import { Link, useParams } from "react-router-dom";
import { AgentAdjudicationCard } from "../components/dev/AgentAdjudicationCard";
import { AgentDissentCard } from "../components/dev/AgentDissentCard";
import { AgentReviewerDecisionCard } from "../components/dev/AgentReviewerDecisionCard";
import { OwnerEscalationCard } from "../components/dev/OwnerEscalationCard";
import { PageContainer } from "../components/layout/PageContainer";
import { demoAgentPanelReview as demo } from "../data/demoAgentPanelReview";

export function AgentPanelItemPage() {
  const { itemId } = useParams();
  const item = demo.items.find((candidate) => candidate.itemId === itemId) ?? demo.items[0];
  return (
    <PageContainer narrow>
      <header className="page-intro reviewer-intro">
        <Link to="/dev/agent-panels">← Agent panel dashboard</Link>
        <div className="normalization-labels">
          <Badge tone="caution">{item.riskClass} risk</Badge>
          <Badge>{item.task}</Badge>
        </div>
        <p className="eyebrow">{item.itemId}</p>
        <h1>{item.headline}</h1>
        <p>
          Panel outcome: <strong>{item.panel.outcome}</strong> · provisional state:{" "}
          <strong>{item.provisionalState}</strong>
        </p>
        <p className="rules-version">
          Packet {item.packetId} · hash <code>{item.packetHash}</code> · packet version
          agent-packet-v1 · role prompt version agent-role-prompt-v1
        </p>
      </header>
      <AgentReviewerDecisionCard item={item} />
      <AgentDissentCard item={item} />
      <AgentAdjudicationCard item={item} />
      <OwnerEscalationCard item={item} />
      <p className="reviewer-boundary-note">
        No independent human review has validated this item. Agent-panel agreement is a reliability
        signal only.
      </p>
    </PageContainer>
  );
}
