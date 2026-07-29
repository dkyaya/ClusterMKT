import { Button, Surface } from "@cluster-mkt/ui";

export function BriefPlayerPreview({ compact = false }: { compact?: boolean }) {
  return (
    <Surface
      aria-label="Audio brief preview"
      className={compact ? "brief-player brief-player--compact" : "brief-player"}
    >
      <div>
        <span className="eyebrow">Preview only</span>
        <strong>Daily market brief</strong>
        <p>Demonstration audio controls · no generated audio is connected</p>
      </div>
      <Button aria-label="Audio playback unavailable in demonstration" disabled variant="secondary">
        Play preview
      </Button>
      {!compact && (
        <div className="audio-track" aria-hidden="true">
          <span />
        </div>
      )}
    </Surface>
  );
}
