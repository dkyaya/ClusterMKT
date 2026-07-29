import { Badge } from "@cluster-mkt/ui";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { PageContainer } from "../components/layout/PageContainer";
import { StoryClusterTabs } from "../components/story/StoryClusterTabs";
import { demoClusters } from "../data/demoClusters";

export function ClusterDetailPage() {
  const { clusterId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab =
    requestedTab === "read" || requestedTab === "listen" || requestedTab === "overview"
      ? requestedTab
      : "overview";
  const cluster = demoClusters.find((candidate) => candidate.id === clusterId);
  if (!cluster)
    return (
      <PageContainer narrow>
        <p>
          <Link to="/">← Today</Link>
        </p>
        <h1>Story Cluster not found</h1>
        <p>This demonstration fixture does not contain that cluster.</p>
      </PageContainer>
    );
  return (
    <PageContainer narrow>
      <header className="cluster-detail-header">
        <Link to="/">← Today</Link>
        <Badge tone="caution">Demonstration data</Badge>
        <h1>{cluster.title}</h1>
        <p>{cluster.shortOverview}</p>
        <div className="tag-row">
          {[...cluster.stocks, ...cluster.sectors, ...cluster.themes].map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </header>
      <StoryClusterTabs
        activeTab={activeTab}
        cluster={cluster}
        onTabChange={(tab) => {
          const next = new URLSearchParams(searchParams);
          next.set("tab", tab);
          setSearchParams(next);
        }}
      />
    </PageContainer>
  );
}
