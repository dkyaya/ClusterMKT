import type { SectorBrief } from "@cluster-mkt/core";
import { Badge, Surface } from "@cluster-mkt/ui";

export function SectorBriefCard({ brief, sectorName }: { brief: SectorBrief; sectorName: string }) {
  const stats = brief.breadthMetrics;
  return (
    <Surface as="article" className="sector-brief-card" aria-labelledby="sector-brief-title">
      <div className="sector-card-heading">
        <div>
          <p className="eyebrow">Shared sector brief · {brief.marketEdition} edition</p>
          <h2 id="sector-brief-title">{sectorName} Sector Brief</h2>
        </div>
        <Badge tone="caution">Demonstration data</Badge>
      </div>
      <p>
        Assembled once for this sector, market date, and edition from accepted active Story
        Clusters—not from raw articles or a personalized model response.
      </p>
      <dl className="sector-metrics">
        <div>
          <dt>Developments</dt>
          <dd>{stats.materialDevelopmentCount}</dd>
        </div>
        <div>
          <dt>Sector-wide</dt>
          <dd>{stats.sectorWideCount}</dd>
        </div>
        <div>
          <dt>Company-led</dt>
          <dd>{stats.companyLedCount}</dd>
        </div>
        <div>
          <dt>Macro</dt>
          <dd>{stats.macroToSectorCount}</dd>
        </div>
        <div>
          <dt>Subindustries</dt>
          <dd>{stats.subindustryCount}</dd>
        </div>
      </dl>
      <div className="sector-brief-grid">
        <section>
          <h3>Key themes</h3>
          <ul>
            {brief.keyThemes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h3>Uncertainty</h3>
          <ul>
            {brief.uncertainty.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h3>What would change the picture</h3>
          <ul>
            {brief.whatWouldChangeThePicture.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </Surface>
  );
}
