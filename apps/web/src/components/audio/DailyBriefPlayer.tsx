import type { MarketEdition } from "@cluster-mkt/core";
import { Button, Surface } from "@cluster-mkt/ui";
import { useMemo, useRef, useState, type PointerEvent } from "react";
import { dailyBriefStorageKey } from "../../lib/dailyBrief";

function sessionStorageSafe(): Storage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.sessionStorage;
  } catch {
    return undefined;
  }
}

function wasDismissed(key: string) {
  try {
    return sessionStorageSafe()?.getItem(key) === "true";
  } catch {
    return false;
  }
}

const editionName = (edition: MarketEdition) =>
  `${edition.charAt(0).toUpperCase()}${edition.slice(1)}`;

export interface DailyBriefPlayerProps {
  edition: MarketEdition;
  now?: Date;
}

export function DailyBriefPlayer({ edition, now = new Date() }: DailyBriefPlayerProps) {
  const storageKey = useMemo(() => dailyBriefStorageKey(now, edition), [edition, now]);
  const [dismissedKeys, setDismissedKeys] = useState<ReadonlySet<string>>(() => new Set());
  const [offset, setOffset] = useState(0);
  const gesture = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    horizontal: boolean;
    width: number;
  } | null>(null);

  const dismiss = () => {
    try {
      sessionStorageSafe()?.setItem(storageKey, "true");
    } catch {
      // Storage can be unavailable in privacy-restricted environments.
    }
    setDismissedKeys((current) => new Set(current).add(storageKey));
  };

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    gesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      horizontal: false,
      width: event.currentTarget.getBoundingClientRect().width,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - active.startX;
    const deltaY = event.clientY - active.startY;
    if (!active.horizontal && Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
      active.horizontal = true;
    }
    if (active.horizontal) setOffset(deltaX);
  };

  const finishPointer = (event: PointerEvent<HTMLElement>) => {
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const threshold = Math.min(96, Math.max(72, active.width * 0.3));
    const finalOffset = event.clientX - active.startX;
    gesture.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (Math.abs(finalOffset) >= threshold) dismiss();
    else setOffset(0);
  };

  if (dismissedKeys.has(storageKey) || wasDismissed(storageKey)) return null;

  const label = `${editionName(edition)} Brief`;
  return (
    <Surface
      aria-label={`${label} demonstration audio`}
      className="daily-brief-player"
      onKeyDown={(event) => {
        if (event.key === "Escape") dismiss();
      }}
      onPointerCancel={(event) => {
        gesture.current = null;
        setOffset(0);
        event.currentTarget.releasePointerCapture?.(event.pointerId);
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishPointer}
      style={{
        opacity: Math.max(0.4, 1 - Math.abs(offset) / 320),
        transform: `translateX(${offset}px)`,
      }}
    >
      <div>
        <span className="eyebrow">Preview only</span>
        <strong>{label}</strong>
        <p>Your followed-market audio briefing is demonstration-only; no generated audio exists.</p>
      </div>
      <div className="daily-brief-player__actions">
        <Button
          aria-label="Daily Brief playback unavailable in demonstration"
          disabled
          variant="secondary"
        >
          Play preview
        </Button>
        <button
          aria-label={`Dismiss ${label}`}
          className="daily-brief-player__close"
          onClick={dismiss}
          type="button"
        >
          ×
        </button>
      </div>
    </Surface>
  );
}
