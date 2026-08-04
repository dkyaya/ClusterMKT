import { Badge, Surface } from "@cluster-mkt/ui";
import type { demoAgentPanelReview } from "../../data/demoAgentPanelReview";

type AgentPanelItem = (typeof demoAgentPanelReview)["items"][number];

export function AgentAdjudicationCard({ item }: { item: AgentPanelItem }) {
  const { adjudication } = item;
  return (
    <Surface as="section" className="reviewer-card">
      <div className="reviewer-heading">
        <h2>Adjudication</h2>
        <Badge tone={adjudication ? "caution" : "neutral"}>
          {adjudication ? adjudication.outcome : "Not routed"}
        </Badge>
      </div>
      {!adjudication ? (
        <p>
          This panel did not route to adjudication
          {item.riskClass === "high"
            ? " — unexpected for a high-risk item and worth checking."
            : "."}
        </p>
      ) : (
        <>
          <p className="eyebrow">
            Isolated adjudicator · no reviewer identity, no gold label, no coordinator preference
          </p>
          <div className="adjudication-grid">
            <article>
              <strong>{adjudication.selectedLabelId ?? "unresolved"}</strong>
              <span>Selected label</span>
            </article>
            <article>
              <strong>{adjudication.confidence}</strong>
              <span>Confidence</span>
            </article>
            <article>
              <strong>{adjudication.decisionsAcceptedMemberIds.length}</strong>
              <span>Decisions accepted</span>
            </article>
            <article>
              <strong>{adjudication.decisionsRejectedMemberIds.length}</strong>
              <span>Decisions rejected</span>
            </article>
          </div>
          <p>
            Accepted: {adjudication.decisionsAcceptedMemberIds.join(", ") || "none"} · Rejected:{" "}
            {adjudication.decisionsRejectedMemberIds.join(", ") || "none"}
          </p>
          <p className="reviewer-boundary-note">
            The adjudicator references panel members only by anonymized id and cannot see which
            pseudonymous worker produced which decision.
          </p>
        </>
      )}
    </Surface>
  );
}
