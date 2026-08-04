import { Badge, Surface } from "@cluster-mkt/ui";
import type { demoAgentPanelReview } from "../../data/demoAgentPanelReview";

type AgentPanelItem = (typeof demoAgentPanelReview)["items"][number];

export function AgentReviewerDecisionCard({ item }: { item: AgentPanelItem }) {
  return (
    <Surface as="section" className="reviewer-card">
      <div className="reviewer-heading">
        <h2>Reviewer decisions</h2>
        <Badge tone="neutral">
          {item.decisions.length} of {item.panel.panelSize} shown
        </Badge>
      </div>
      <p className="eyebrow">Anonymized panel-member id · role · label only</p>
      <ol className="decision-trace">
        {item.decisions.map((decision) => (
          <li key={decision.anonymizedMemberId}>
            <span>
              <strong>
                {decision.anonymizedMemberId} · {decision.role}
              </strong>
              <code>
                {decision.cannotDetermine ? "cannot_determine" : decision.selectedLabelId}
              </code>
            </span>
            <Badge tone={decision.confidence === "high" ? "accent" : "neutral"}>
              {decision.confidence} confidence
            </Badge>
          </li>
        ))}
      </ol>
      <p className="reviewer-boundary-note">
        Reviewer pseudonyms and full free-text explanations are never shown to the adjudicator; only
        the anonymized panel-member id, role, and structured fields are passed forward.
      </p>
    </Surface>
  );
}
