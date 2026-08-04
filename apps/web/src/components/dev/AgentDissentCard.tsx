import { Badge, Surface } from "@cluster-mkt/ui";
import type { demoAgentPanelReview } from "../../data/demoAgentPanelReview";

type AgentPanelItem = (typeof demoAgentPanelReview)["items"][number];

export function AgentDissentCard({ item }: { item: AgentPanelItem }) {
  return (
    <Surface as="section" className="reviewer-card">
      <div className="reviewer-heading">
        <h2>Dissent</h2>
        <Badge tone={item.dissent.length ? "caution" : "accent"}>
          {item.dissent.length ? `${item.dissent.length} dissenting` : "None"}
        </Badge>
      </div>
      {item.dissent.length === 0 ? (
        <p>No panel member dissented from the majority label.</p>
      ) : (
        <ol className="decision-trace">
          {item.dissent.map((dissent) => (
            <li key={dissent.anonymizedMemberId}>
              <span>
                <strong>
                  {dissent.anonymizedMemberId} · {dissent.role}
                </strong>
                <code>{dissent.dissentingLabelId ?? "cannot_determine"}</code>
              </span>
              <Badge tone={dissent.isCritical ? "caution" : "neutral"}>
                {dissent.isCritical ? "critical" : "non-critical"}
              </Badge>
            </li>
          ))}
        </ol>
      )}
      <p className="reviewer-boundary-note">
        Dissent is never hidden to present a falsely confident result. High-confidence critical
        dissent routes to adjudication and can require owner review even when a majority exists.
      </p>
    </Surface>
  );
}
