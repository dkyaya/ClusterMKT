import { Badge, Surface } from "@cluster-mkt/ui";
import { demoClusterInspection } from "../../data/demoClusterInspection";

export function ReviewRoutingCard() {
  const { review, reviewRequiredExample, quarantinedExample } = demoClusterInspection;
  return (
    <Surface as="section" className="cluster-inspector-section">
      <p className="eyebrow">Final gate</p>
      <h2>Review routing</h2>
      <div className="review-routing-grid">
        <article>
          <Badge tone="accent">{review.status}</Badge>
          <h3>Accepted example</h3>
          <p>
            Eligible for display: <strong>{String(review.eligibleForDisplay)}</strong>
          </p>
          <p>
            Eligible for Sector Brief: <strong>{String(review.eligibleForSectorBrief)}</strong>
          </p>
          <p>{review.reasons[0]}</p>
          <small>{review.warnings[0]}</small>
        </article>
        <article>
          <Badge tone="caution">{reviewRequiredExample.status}</Badge>
          <h3>{reviewRequiredExample.id}</h3>
          <p>{reviewRequiredExample.reason}</p>
          <p>
            Display: {String(reviewRequiredExample.eligibleForDisplay)} · Sector Brief:{" "}
            {String(reviewRequiredExample.eligibleForSectorBrief)}
          </p>
        </article>
        <article>
          <Badge tone="caution">{quarantinedExample.status}</Badge>
          <h3>{quarantinedExample.id}</h3>
          <p>{quarantinedExample.reason}</p>
        </article>
      </div>
    </Surface>
  );
}
