import type { ClusterScope, SectorFeedItem } from "@cluster-mkt/core";
import { Surface } from "@cluster-mkt/ui";
import { Link } from "react-router-dom";
import { sectorRouteByClusterId } from "../../data/demoSectorCoverage";
import { SectorScopeBadge } from "./SectorScopeBadge";

const sectionTitles: Record<ClusterScope, string> = {
  sector_wide: "Sector-wide developments",
  company_led_sector_impact: "Company-led sector impacts",
  macro_to_sector: "Macro context",
  company_specific: "High-materiality company-specific context",
};

export function SectorClusterSection({
  scope,
  items,
}: {
  scope: ClusterScope;
  items: SectorFeedItem[];
}) {
  if (items.length === 0) return null;
  const id = `scope-${scope}`;
  return (
    <section className="sector-cluster-section" aria-labelledby={id}>
      <div className="section-heading">
        <h2 id={id}>{sectionTitles[scope]}</h2>
        <span>{items.length} active</span>
      </div>
      <div className="sector-cluster-grid">
        {items.map((item) => (
          <Surface as="article" className="sector-cluster-card" key={item.id}>
            <SectorScopeBadge scope={item.scope} />
            <h3>{item.title}</h3>
            <p>{item.whyIncluded}</p>
            <ul className="sector-tag-list" aria-label="Affected subindustries">
              {item.subindustryIds.map((id) => (
                <li key={id}>{id.replaceAll("_", " ")}</li>
              ))}
            </ul>
            <div className="sector-cluster-meta">
              <span>{item.sourceCount} fixture sources</span>
              <span>Materiality {item.materialityScore}/100</span>
            </div>
            <Link to={sectorRouteByClusterId[item.id] ?? "/"}>Open related Story Cluster</Link>
          </Surface>
        ))}
      </div>
    </section>
  );
}
