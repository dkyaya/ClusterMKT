import { Badge, Surface } from "@cluster-mkt/ui";
import { demoNormalization } from "../../data/demoNormalization";

const toneByStatus = (status: string): "accent" | "neutral" | "caution" =>
  status === "accepted" ? "accent" : status === "rejected" ? "neutral" : "caution";

export function EntityDecisionList() {
  return (
    <Surface className="normalization-section" aria-labelledby="entity-decisions-heading">
      <p className="eyebrow">Candidates are not acceptance</p>
      <h2 id="entity-decisions-heading">Entity decisions</h2>
      <div className="entity-decision-list">
        {demoNormalization.entities.map((decision) => (
          <article className="entity-decision" key={`${decision.entity}-${decision.field}`}>
            <div className="normalization-card__heading">
              <h3>{decision.entity}</h3>
              <Badge tone={toneByStatus(decision.status)}>{decision.status}</Badge>
            </div>
            <p>
              Matched “{decision.alias}” in {decision.field} · {decision.confidence} confidence
            </p>
            <ul className="decision-code-list">
              {decision.codes.map((code) => (
                <li key={code}>{code}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Surface>
  );
}
