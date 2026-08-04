import { Badge, Surface } from "@cluster-mkt/ui";
import type { demoAgentPanelReview } from "../../data/demoAgentPanelReview";

type AgentPanelItem = (typeof demoAgentPanelReview)["items"][number];

export function OwnerEscalationCard({ item }: { item: AgentPanelItem }) {
  const { ownerEscalation } = item;
  const required = ownerEscalation.status !== "not_required";
  return (
    <Surface as="section" className="reviewer-card">
      <div className="reviewer-heading">
        <h2>Owner escalation</h2>
        <Badge tone={required ? "caution" : "accent"}>{ownerEscalation.status}</Badge>
      </div>
      {!required ? (
        <p>No owner review is required for this unanimous low/standard-risk item.</p>
      ) : (
        <>
          <p>Reasons:</p>
          <p className="tag-row">
            {ownerEscalation.reasons.map((reason) => (
              <span key={reason}>{reason}</span>
            ))}
          </p>
        </>
      )}
      <p className="reviewer-boundary-note">
        The existing owner-review workflow remains the optional final confirmation layer. Agent
        review cannot promote a case to final human-validated gold on its own.
      </p>
    </Surface>
  );
}
