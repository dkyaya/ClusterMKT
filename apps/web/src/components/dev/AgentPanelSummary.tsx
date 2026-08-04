import { Badge, Surface } from "@cluster-mkt/ui";
import { Link } from "react-router-dom";
import { demoAgentPanelReview as demo } from "../../data/demoAgentPanelReview";

const outcomeTone: Record<string, "accent" | "neutral" | "caution"> = {
  agent_panel_unanimous: "accent",
  agent_panel_strong_consensus: "accent",
  agent_panel_majority: "neutral",
  agent_panel_split: "caution",
  agent_panel_disputed: "caution",
  agent_panel_insufficient: "caution",
  agent_panel_invalid: "caution",
};

const riskTone: Record<string, "accent" | "neutral" | "caution"> = {
  low: "neutral",
  standard: "neutral",
  high: "caution",
};

export function AgentPanelSummary() {
  return (
    <Surface as="section" className="reviewer-card">
      <div className="reviewer-heading">
        <h2>Agent panel outcomes</h2>
        <Badge tone="caution">Agent review · provisional</Badge>
      </div>
      <p className="eyebrow">Direct URL only · absent from consumer navigation</p>
      <div className="review-routing-grid">
        {demo.items.map((item) => (
          <article key={item.itemId}>
            <Badge tone={outcomeTone[item.panel.outcome] ?? "neutral"}>{item.panel.outcome}</Badge>{" "}
            <Badge tone={riskTone[item.riskClass] ?? "neutral"}>{item.riskClass} risk</Badge>
            <h3>{item.itemId}</h3>
            <p>{item.headline}</p>
            <p>
              Panel: {item.panel.validDecisionCount}/{item.panel.panelSize} valid · majority share{" "}
              {item.panel.majorityShare === null
                ? "n/a"
                : `${Math.round(item.panel.majorityShare * 100)}%`}
            </p>
            <small>
              Owner escalation: {item.ownerEscalation.status}
              {item.adjudication ? " · adjudicated" : ""}
            </small>
            <p>
              <Link className="reviewer-primary-link" to={`/dev/agent-panels/${item.itemId}`}>
                View packet, decisions, and dissent →
              </Link>
            </p>
          </article>
        ))}
      </div>
    </Surface>
  );
}
