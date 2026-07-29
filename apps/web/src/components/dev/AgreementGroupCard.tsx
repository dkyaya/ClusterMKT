import { Badge, Surface } from "@cluster-mkt/ui";
import { demoClusterInspection } from "../../data/demoClusterInspection";

export function AgreementGroupCard() {
  const item = demoClusterInspection.agreement;
  return (
    <Surface as="article" className="cluster-inspector-card">
      <div className="cluster-inspector-heading">
        <h2>Agreement group</h2>
        <Badge tone="accent">{item.strength}</Badge>
      </div>
      <p>{item.proposition}</p>
      <p>
        <strong>Support:</strong> {item.support}
      </p>
      <p className="inspector-qualification">{item.qualification}</p>
    </Surface>
  );
}
