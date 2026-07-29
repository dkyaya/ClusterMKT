import { semiconductorsSector } from "@cluster-mkt/config";
import { Badge, Surface } from "@cluster-mkt/ui";
import { Link } from "react-router-dom";
import { PageContainer } from "../components/layout/PageContainer";

export function SectorsPage() {
  return (
    <PageContainer>
      <header className="page-intro">
        <Badge tone="caution">Demonstration data</Badge>
        <p className="eyebrow">Followed coverage</p>
        <h1>Sectors</h1>
        <p>
          Sector following organizes broad, company-led, macro, and threshold-qualified company
          developments without treating the largest issuer as the whole sector.
        </p>
      </header>
      <Surface as="article" className="sector-index-card">
        <div>
          <Badge tone="accent">Following</Badge>
          <h2>{semiconductorsSector.name}</h2>
          <p>{semiconductorsSector.description}</p>
        </div>
        <dl className="sector-metrics">
          <div>
            <dt>Subindustries</dt>
            <dd>{semiconductorsSector.subindustries.length}</dd>
          </div>
          <div>
            <dt>Taxonomy</dt>
            <dd>v1</dd>
          </div>
        </dl>
        <Link to="/sectors/semiconductors">View sector coverage</Link>
      </Surface>
    </PageContainer>
  );
}
