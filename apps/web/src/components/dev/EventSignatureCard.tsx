import { Badge, Surface } from "@cluster-mkt/ui";
import { demoNormalization } from "../../data/demoNormalization";

export function EventSignatureCard() {
  const { event } = demoNormalization;
  return (
    <Surface className="normalization-section" aria-labelledby="event-signature-heading">
      <div className="normalization-card__heading">
        <div>
          <p className="eyebrow">Entity plus date is not enough</p>
          <h2 id="event-signature-heading">Event signature</h2>
        </div>
        <Badge tone="accent">{event.type}</Badge>
      </div>
      <dl className="normalization-fields">
        <div>
          <dt>Action</dt>
          <dd>{event.action}</dd>
        </div>
        <div>
          <dt>Primary entity</dt>
          <dd>{event.primaryEntities.join(", ")}</dd>
        </div>
        <div>
          <dt>Sector</dt>
          <dd>{event.sector}</dd>
        </div>
        <div>
          <dt>Subindustries</dt>
          <dd>{event.subindustries.join(", ")}</dd>
        </div>
        <div>
          <dt>Announcement</dt>
          <dd>{event.announcementDate}</dd>
        </div>
        <div>
          <dt>Boundary result</dt>
          <dd>{event.relationship}</dd>
        </div>
      </dl>
      <ul className="decision-code-list">
        {event.codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
    </Surface>
  );
}
