import { Badge } from "@cluster-mkt/ui";
import { BriefPlayerPreview } from "../components/audio/BriefPlayerPreview";
import { PageContainer } from "../components/layout/PageContainer";
import { StoryClusterCard } from "../components/story/StoryClusterCard";
import { demoClusters } from "../data/demoClusters";
import { formatDate } from "../lib/format";

export function TodayPage() {
  return (
    <PageContainer>
      <header className="page-intro">
        <Badge tone="caution">Demonstration data</Badge>
        <p className="eyebrow">{formatDate(new Date())}</p>
        <h1>Your market context, organized.</h1>
        <p>
          This static shell demonstrates evidence-centered Story Clusters. No live market data or
          connected services are present.
        </p>
      </header>
      <section aria-labelledby="brief-heading" className="daily-brief">
        <div>
          <p className="eyebrow">Daily market brief</p>
          <h2 id="brief-heading">A calm view of material developments</h2>
          <p>3 demonstration developments · 5 followed themes</p>
          <div className="brief-stats">
            <span>6 min read</span>
            <span>9 min listen preview</span>
          </div>
        </div>
        <BriefPlayerPreview />
      </section>
      <section aria-labelledby="clusters-heading" className="cluster-list">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Story Clusters</p>
            <h2 id="clusters-heading">Material developments</h2>
          </div>
          <span>{demoClusters.length} shown</span>
        </div>
        {demoClusters.map((cluster) => (
          <StoryClusterCard cluster={cluster} key={cluster.id} />
        ))}
      </section>
    </PageContainer>
  );
}
