import { Badge, Surface } from "@cluster-mkt/ui";
import { demoClusterInspection } from "../../data/demoClusterInspection";
import { ClaimEvidenceList } from "./ClaimEvidenceList";

export function ClaimCard() {
  return (
    <section className="cluster-inspector-section" aria-labelledby="claims-heading">
      <p className="eyebrow">Claim contract</p>
      <h2 id="claims-heading">Claims and evidence</h2>
      <div className="claim-card-grid">
        {demoClusterInspection.claims.map((claim) => (
          <Surface as="article" className="claim-card" key={claim.id}>
            <div className="cluster-inspector-heading">
              <Badge>{claim.type}</Badge>
              <Badge tone={claim.status.includes("unsupported") ? "caution" : "accent"}>
                {claim.status}
              </Badge>
            </div>
            <h3>{claim.text}</h3>
            <code>{claim.id}</code>
            <ClaimEvidenceList
              evidence={claim.evidence}
              depth={claim.evidenceDepth}
              support={claim.independentSupport}
            />
            <ul className="decision-code-list">
              {claim.codes.map((code) => (
                <li key={code}>{code}</li>
              ))}
            </ul>
          </Surface>
        ))}
      </div>
    </section>
  );
}
