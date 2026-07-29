import { Surface } from "@cluster-mkt/ui";
import { demoClusterInspection } from "../../data/demoClusterInspection";

export function ProvenancePath() {
  return (
    <Surface as="section" className="cluster-inspector-section">
      <p className="eyebrow">Claim-level trace</p>
      <h2>Provenance paths</h2>
      <ol className="provenance-path-list">
        {demoClusterInspection.provenancePaths.map((path) => (
          <li key={path}>
            <code>{path}</code>
          </li>
        ))}
      </ol>
    </Surface>
  );
}
