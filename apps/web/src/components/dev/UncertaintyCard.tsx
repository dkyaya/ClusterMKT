import { Badge, Surface } from "@cluster-mkt/ui";
import { demoClusterInspection } from "../../data/demoClusterInspection";

export function UncertaintyCard() {
  const item = demoClusterInspection.uncertainty;
  return (
    <Surface as="section" className="cluster-inspector-section uncertainty-card">
      <div className="cluster-inspector-heading">
        <h2>What remains uncertain</h2>
        <Badge tone="caution">{item.type}</Badge>
      </div>
      <p>{item.summary}</p>
      <p>
        <strong>Evidence gap:</strong> {item.gap}
      </p>
      <p>
        <strong>What would change the picture:</strong> {item.resolution}
      </p>
    </Surface>
  );
}
