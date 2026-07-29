import { Button, Surface } from "@cluster-mkt/ui";

export interface ClusterAudioBriefPreviewProps {
  clusterId: string;
  clusterTitle: string;
}

export function ClusterAudioBriefPreview({
  clusterId,
  clusterTitle,
}: ClusterAudioBriefPreviewProps) {
  return (
    <Surface
      aria-label={`Cluster audio brief for ${clusterTitle}`}
      className="cluster-audio-preview"
      data-cluster-id={clusterId}
    >
      <div>
        <span className="eyebrow">Cluster audio preview</span>
        <strong>{clusterTitle}</strong>
        <p>Cluster-specific generated audio is not connected yet. No audio was produced.</p>
      </div>
      <Button
        aria-label="Cluster audio playback unavailable in demonstration"
        disabled
        variant="secondary"
      >
        Play preview
      </Button>
    </Surface>
  );
}
