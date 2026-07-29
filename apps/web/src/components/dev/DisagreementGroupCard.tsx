import { Badge, Surface } from "@cluster-mkt/ui";
import { demoClusterInspection } from "../../data/demoClusterInspection";

export function DisagreementGroupCard() {
  const item = demoClusterInspection.disagreement;
  return (
    <Surface as="article" className="cluster-inspector-card">
      <div className="cluster-inspector-heading">
        <h2>Disagreement group</h2>
        <Badge tone="caution">{item.type}</Badge>
      </div>
      {item.propositions.map((text, index) => (
        <div className="disagreement-side" key={text}>
          <p>{text}</p>
          <small>{item.evidenceStrength[index]}</small>
        </div>
      ))}
      <p className="inspector-qualification">{item.resolution}</p>
    </Surface>
  );
}
