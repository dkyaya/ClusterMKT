import { Badge } from "@cluster-mkt/ui";
import { Link, useParams } from "react-router-dom";
import { CoverageGapNotice } from "../components/sector/CoverageGapNotice";
import { SectorBriefCard } from "../components/sector/SectorBriefCard";
import { SectorClusterSection } from "../components/sector/SectorClusterSection";
import { SubindustryCoverage } from "../components/sector/SubindustryCoverage";
import { PageContainer } from "../components/layout/PageContainer";
import { createDemoSectorCoverage } from "../data/demoSectorCoverage";
import { currentEdition } from "../lib/edition";
import { NotFoundPage } from "./NotFoundPage";

export function SectorDetailPage() {
  const { sectorId } = useParams();
  if (sectorId !== "semiconductors") return <NotFoundPage />;
  const { sector, feed, brief } = createDemoSectorCoverage(currentEdition());
  return (
    <PageContainer>
      <header className="page-intro sector-detail-intro">
        <Link to="/sectors">← All sectors</Link>
        <div className="sector-heading-badges">
          <Badge tone="caution">Demonstration data</Badge>
          <Badge tone="accent">Following</Badge>
        </div>
        <p className="eyebrow">
          {brief.marketEdition} edition · {brief.marketDate}
        </p>
        <h1>{sector.name}</h1>
        <p>
          This bounded experience is assembled from deterministic fixture Story Clusters. It is not
          live, personalized, or comprehensive.
        </p>
      </header>
      <SectorBriefCard brief={brief} sectorName={sector.name} />
      <SubindustryCoverage sector={sector} feed={feed} />
      {(
        ["sector_wide", "company_led_sector_impact", "macro_to_sector", "company_specific"] as const
      ).map((scope) => (
        <SectorClusterSection
          key={scope}
          scope={scope}
          items={feed.items.filter((item) => item.scope === scope)}
        />
      ))}
      <CoverageGapNotice gaps={feed.coverageGaps} />
      <section className="sector-method" aria-labelledby="assembly-heading">
        <p className="eyebrow">How this feed is assembled</p>
        <h2 id="assembly-heading">Materiality first, breadth when comparable</h2>
        <p>
          Shared clusters are classified by scope, filtered by documented sector propagation, and
          ranked transparently. Sector-wide and macro developments remain distinct; issuer
          concentration safeguards apply only to company-led and company-specific positions.
        </p>
      </section>
    </PageContainer>
  );
}
