import type { StoryCluster } from "@cluster-mkt/core";
import { Tabs } from "@cluster-mkt/ui";
import { ClusterAudioBriefPreview } from "../audio/ClusterAudioBriefPreview";
import { PodcastCard } from "./PodcastCard";
import { SourceCard } from "./SourceCard";

export interface StoryClusterTabsProps {
  activeTab: "overview" | "read" | "listen";
  cluster: StoryCluster;
  onTabChange: (id: string) => void;
}

export function StoryClusterTabs({ activeTab, cluster, onTabChange }: StoryClusterTabsProps) {
  const overview = (
    <div className="cluster-overview">
      <p className="cluster-evidence-summary" aria-label="Cluster evidence counts">
        <span>{cluster.sourceCount} raw sources</span>
        <span>{cluster.independentSourceCount} independent sources</span>
        <span>{cluster.primarySourceCount} primary sources</span>
        <span>{cluster.claimIds.length} supported fixture claims</span>
      </p>
      {cluster.sections.map((section) => (
        <section key={section.key}>
          <h2>{section.title}</h2>
          <p>{section.body}</p>
        </section>
      ))}
      <section>
        <h2>Points of agreement</h2>
        <ul>
          {cluster.agreementPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Competing arguments</h2>
        {cluster.competingArguments.map((argument) => (
          <div key={argument.id}>
            <h3>{argument.label}</h3>
            <p>{argument.summary}</p>
          </div>
        ))}
      </section>
      <section>
        <h2>What remains uncertain</h2>
        {cluster.uncertainty.map((item) => (
          <p key={item.id}>{item.summary}</p>
        ))}
      </section>
      <section>
        <h2>What would change the picture</h2>
        <ul>
          {cluster.whatWouldChangeThePicture.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Related coverage</h2>
        <p>{[...cluster.stocks, ...cluster.sectors, ...cluster.themes].join(" · ")}</p>
      </section>
      <section>
        <h2>Claim provenance</h2>
        {cluster.claimProvenance.map((trace) => (
          <p className="cluster-provenance-note" key={trace.claimId}>
            <strong>{trace.claimId}:</strong> {trace.pathSummary}
          </p>
        ))}
      </section>
    </div>
  );
  return (
    <Tabs
      activeTab={activeTab}
      label="Story Cluster sections"
      onChange={onTabChange}
      items={[
        { id: "overview", label: "Overview", panel: overview },
        {
          id: "read",
          label: `Read (${cluster.readSources.length})`,
          panel: (
            <div className="source-grid">
              {cluster.readSources.map((source) => (
                <SourceCard key={source.id} source={source} />
              ))}
            </div>
          ),
        },
        {
          id: "listen",
          label: `Listen (${cluster.listenSources.length})`,
          panel: (
            <>
              <ClusterAudioBriefPreview clusterId={cluster.id} clusterTitle={cluster.title} />
              <div className="source-grid">
                {cluster.listenSources.map((source) => (
                  <PodcastCard key={source.id} podcast={source} />
                ))}
              </div>
            </>
          ),
        },
      ]}
    />
  );
}
