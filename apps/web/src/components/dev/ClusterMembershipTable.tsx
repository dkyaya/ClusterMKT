import { Badge, Surface } from "@cluster-mkt/ui";
import { demoClusterInspection } from "../../data/demoClusterInspection";

export function ClusterMembershipTable() {
  return (
    <Surface as="section" className="cluster-inspector-section">
      <p className="eyebrow">Boundary decisions</p>
      <h2>Cluster membership</h2>
      <ul className="membership-table" aria-label="Cluster membership decisions">
        {demoClusterInspection.memberships.map((item) => (
          <li key={item.recordId} className="membership-row">
            <div>
              <strong>{item.publisher}</strong>
              <code>{item.recordId}</code>
            </div>
            <div>
              <Badge
                tone={
                  item.status === "accepted"
                    ? "accent"
                    : item.status === "rejected"
                      ? "caution"
                      : "neutral"
                }
              >
                {item.status}
              </Badge>
              <span>{item.role}</span>
            </div>
            <code>{item.explanation}</code>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
